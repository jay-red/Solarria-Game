var URL = document.location.href,
	SERVER = URL.indexOf( "server" ) >= 0;

var KEY_A = 65,
	KEY_D = 68,
	KEY_SPACE = 32;

var WIDTH_TILE = 8,
	HEIGHT_TILE = 8,
	TWIDTH_VIEWPORT = 64,
	WIDTH_VIEWPORT = TWIDTH_VIEWPORT * WIDTH_TILE,
	HEIGHT_VIEWPORT = window.screen.height * WIDTH_VIEWPORT / window.screen.width,
	HWIDTH_VIEWPORT = WIDTH_VIEWPORT >> 1,
	HHEIGHT_VIEWPORT = HEIGHT_VIEWPORT >> 1,
	WIDTH_GAME,
	HEIGHT_GAME,
	LEFT_MB_DOWN = false;
	MID_MB_DOWN = false;
	RIGHT_MB_DOWN = false;

var TERMINAL_VELOCITY = 0.5,
	MAX_FLIGHT = -0.35,
	GRAVITY = 0.0013,
	FLIGHT = 0.0025; 

var anims_idle = [null, null, null, null],
	anims_run = [null, null, null, null],
	anims_glide = [null, null, null, null],
	anims_flap = [null, null, null, null],
	anim,
	tiles, 
	tile_canvas,
	game_canvas = document.getElementById( "game" ),
	game_ctx,
	view_x = 240 * WIDTH_TILE,
	view_y = 400 * HEIGHT_TILE,
	cursor_vx = 0,
	cursor_vy = 0,
	cursor_x = 0,
	cursor_y = 0,
	keys = {},
	me = null,
	conn = null, 
	received = 0,
	last_send = -1,
	renderer = null;

function key_down( key ) {
	if( keys.hasOwnProperty( key ) ) {
		return keys[ key ];
	}
	return false;
}

game_canvas.width = WIDTH_VIEWPORT;
game_canvas.height = HEIGHT_VIEWPORT;
game_ctx = game_canvas.getContext( "2d" );

function Entity( width, height ) {
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
	this.width = width;
	this.height = height;
	this.anim = null;
	this.frame = 0;
	this.last_anim = -1;
	this.last_update = -1;
	this.direction = 0;
}

function Boss() {
	this.ent = new Entity( 40, 68 );
	this.alive = false;
	this.active = false;
}

function Me( id ) {
	this.id = id;
	this.last_update = -1;
}

function Player( id ) {
	this.id = id;
	this.ent = new Entity( 6, 18 );
	this.ent.anim = anims_idle[ id ];
	this.flight_time = 1600;
	this.time_jump = -1;
	this.flying = false;
	this.alive = false;
	this.active = false;
}

function Fireball( id ) {
	this.id = id;
	this.active = false;
}

var boss,
	players = [];

boss = new Boss();

function init_players() {
	for( var i = 0; i < 4; ++i ) players.push( new Player( i ) );
}

var projectiles = [[], [], [], []];

function init_projectiles() {
	for( var i = 0; i < 4; ++i ) projectiles.push( new Fireball( i ) );
}

function update_boss( ts ) {
	if( boss.ent.last_update == -1 ) boss.ent.last_update = ts;
	boss.ent.last_update = ts;
}

function update_me( ts ) {
	if( me.last_update == -1 ) me.last_update = ts;
	var player = players[ me.id ];
	var ent = player.ent;
	var ticks = ts - me.last_update;
	var down_left = key_down( KEY_A );
	var down_right = key_down( KEY_D );
	var down_space = key_down( KEY_SPACE );
	if( down_left && !down_right ) {
		ent.dx = -0.175;
	} else if( !down_left && down_right ) {
		ent.dx = 0.175;
	} else {
		ent.dx = 0;
	}
	if( down_space ) {
		if( player.time_jump == -1 ) {
			ent.dy = -1.5;
			player.time_jump = ts;
		} else if( ent.dy > 0 ) {
			player.flying = true;
		}
	} else {
		player.flying = false;
	}
}

function get_tile( x, y ) {
	if( x >= 0 && x < TWIDTH_GAME ) {
		if( y >= 0 && y < THEIGHT_GAME ) {
			return tiles[ y ][ x ] & 0xFF;
		}
	}
	return 0;
}

function check_clearance( x, y ) {
	if( y - 3 < 0 ) return false;
	return get_tile( x, y - 1 ) == 0 && get_tile( x, y - 2 ) == 0 && get_tile( x, y - 3 ) == 0;
}

function set_anim( ent, anim ) {
	if( anim == ent.anim ) return;
	ent.frame = 0;
	ent.last_anim = -1;
	ent.anim = anim;
}

function update_player( ts, player ) {
	if( player.ent.last_update == -1 ) player.ent.last_update = ts;
	var ent = player.ent;
	var ticks = ts - ent.last_update;

	var terminal = TERMINAL_VELOCITY;
	if( player.flying ) {
		if( player.flight_time > 0 ) {
			ent.dy -= FLIGHT * ticks;
		} else {
			terminal = 0.3;
		}
	}

	ent.dy += GRAVITY * ticks;
	if( ent.dy > terminal ) {
		ent.dy = terminal;
	} else if( ent.dy < MAX_FLIGHT ) {
		ent.dy = MAX_FLIGHT;
	}

	var last_x = ent.x;
	var last_y = ent.y;

	var next_x = last_x + ticks * ent.dx;
	var next_y = last_y + ticks * ent.dy;

	var tx, ty, c = true;

	if( ent.dx > 0 ) {
		var up_tile = Math.floor( last_y / 8 );
		var down_tile = Math.floor( ( last_y + ent.height - 1 ) / 8 );
		var start_tile_x = Math.floor( ( last_x + ent.width ) / 8 );
		var end_tile_x = Math.floor( ( next_x + ent.width ) / 8 );
		for( ty = up_tile; ty <= down_tile && c; ++ty ) {
			for( tx = start_tile_x; tx <= end_tile_x; ++tx ) {
				if( get_tile( tx, ty ) != 0 ) {
					next_x = ( tx * WIDTH_TILE - ent.width );
					c = false;
					break;
				}
			}
		}
		if( !c && player.time_jump == -1 ) {
			if( check_clearance( Math.floor( ( next_x + ent.width + 1 ) / 8 ), down_tile ) &&
				check_clearance( Math.floor( ( next_x + ent.width + 1 ) / 8 ) - 1, down_tile ) ) {
				ent.dy = 0;
				next_y = ( down_tile - 1 ) * HEIGHT_TILE - ent.height;
				console.log( "stepped" );
				next_x += 1;
			}
		}
	} else if( ent.dx < 0 ) {
		var up_tile = Math.floor( last_y / 8 );
		var down_tile = Math.floor( ( last_y + ent.height - 1 ) / 8 );
		var start_tile_x = Math.floor( last_x / 8 );
		var end_tile_x = Math.floor( next_x / 8 );
		for( ty = up_tile; ty <= down_tile && c; ++ty ) {
			for( tx = start_tile_x; tx >= end_tile_x; --tx ) {
				if( get_tile( tx, ty ) != 0 ) {
					next_x = ( ( tx + 1 ) * WIDTH_TILE );
					c = false;
					break;
				}
			}
		}
		if( !c && player.time_jump == -1 ) {
			if( check_clearance( Math.floor( ( next_x - 1 ) / 8 ), down_tile ) && 
				check_clearance( Math.floor( ( next_x - 1 ) / 8 ), down_tile ) + 1 ) {
				ent.dy = 0;
				next_y = ( down_tile - 1 ) * HEIGHT_TILE - ent.height;
				next_x -= 1;
			}
		}
	}

	c = true;
	if( ent.dy > 0 ) {
		var left_tile = Math.floor( next_x / 8 );
		var right_tile = Math.floor( ( next_x + ent.width - 1 ) / 8 );
		var start_tile_y = Math.floor( ( last_y + ent.height - 1 ) / 8 );
		var end_tile_y = Math.floor( ( next_y + ent.height ) / 8 );
		for( tx = left_tile; tx <= right_tile && c; ++tx ) {
			for( ty = start_tile_y; ty <= end_tile_y; ++ty ) {
				if( get_tile( tx, ty ) != 0 ) {
					next_y = ( ty * HEIGHT_TILE - ent.height );
					c = false;
					ent.dy = 0;
					player.time_jump = -1;
					break;
				}
			}
		}
	} else if( ent.dy < 0 ) {
		var left_tile = Math.floor( next_x / 8 );
		var right_tile = Math.floor( ( next_x + ent.width - 1 ) / 8 );
		var start_tile_y = Math.floor( last_y / 8 );
		var end_tile_y = Math.floor( next_y / 8 );
		for( tx = left_tile; tx <= right_tile && c; ++tx ) {
			for( ty = start_tile_y; ty >= end_tile_y; --ty ) {
				if( get_tile( tx, ty ) != 0 ) {
					next_y = ( ty + 1 ) * HEIGHT_TILE;
					ent.dy = 0;
					c = false;
					break;
				}
			}
		}
	}

	if( next_y + ent.height >= HEIGHT_GAME ) {
		if( ent.dy > 0 ) ent.dy = 0;
		next_y = HEIGHT_GAME - ent.height;
		player.time_jump = -1;
	}
	if( next_x + ent.width >= WIDTH_GAME ) {
		next_x = WIDTH_GAME - ent.width;
	}
	if( next_x < 0 ) {
		next_x = 0;
	}
	ent.x = next_x;
	ent.y = next_y;
	if( ent.dx < 0 ) {
		ent.direction = 0;
	} else if( ent.dx > 0 ) {
		ent.direction = 1;
	}
	if( player.time_jump == -1 ) {
		player.flying = false;
	}
	if( ent.dx == 0 && ent.dy == 0 && !player.flying ) {
		set_anim( ent, anims_idle[ player.id ] );
	} else {
		if( player.flying ) {
			if( player.flight_time > 0 ) {
				set_anim( ent, anims_flap[ player.id ] );
			} else {
				set_anim( ent, anims_glide[ player.id ] );
			}
		} else {
			if( ent.dx != 0 && player.time_jump	== -1 ) {
				set_anim( ent, anims_run[ player.id ] );
			} else {
				set_anim( ent, anims_glide[ player.id ] );
			}
		}
	}
	player.ent.last_update = ts;
}

function update_players( ts ) {
	var player;
	for( var i = 0; i < 4; ++i ) {
		player = players[ i ];
		if( player.active ) {
			if( !SERVER && me.id == i ) {
				update_me( ts );
				update_player( ts, player );
				view_x = Math.floor( player.ent.x - HWIDTH_VIEWPORT + ( player.ent.width >> 2 ) );
				view_y = Math.floor( player.ent.y - HHEIGHT_VIEWPORT + ( player.ent.height >> 2 ) );
			} else {
				update_player( ts, player );
			}
		}
	}
}

function draw_entity( ent, ts ) {
	var anim = ent.anim,
		sprite = anim.assets[ ent.direction ];
	if( ent.last_anim == -1 ) ent.last_anim = ts;
	if( ts - ent.last_anim > anim.delay ) {
		ent.frame = ( ent.frame + 1 ) % anim.frames;
		ent.last_anim = ts;
	}

	game_ctx.drawImage( sprite.img, ent.frame * anim.width, 0, anim.width, anim.height, Math.floor( ent.x - view_x - sprite.left ), Math.floor( ent.y - view_y - sprite.top ), anim.width, anim.height );
	//game_ctx.clearRect( Math.floor( ent.x - view_x ), Math.floor( ent.y - view_y ), 6, 18 );
}

function draw_boss( ts ) {

}

function draw_players( ts ) {
	var player,
		ent,
		anim;
	for( var i = 0; i < 4; ++i ) {
		player = players[ i ];
		if( player.active ) {
			if( player.alive ) {
				ent = player.ent;
				draw_entity( ent, ts );
			}
		}
	}
}

function draw_viewport( ts ) {
	game_ctx.clearRect( 0, 0, WIDTH_VIEWPORT, HEIGHT_VIEWPORT );
	game_ctx.drawImage( tile_canvas, view_x, view_y, WIDTH_VIEWPORT, HEIGHT_VIEWPORT, 0, 0, WIDTH_VIEWPORT, HEIGHT_VIEWPORT );
	draw_boss( ts );
	draw_players( ts );
}

function break_tile( x, y ) {
	tiles[ y ][ x ] = 0;
	renderer.orient_tile( x, y );
	renderer.draw_tile( x, y );
	if( x - 1 >= 0 ) renderer.orient_tile( x - 1, y );
	if( y + 1 < THEIGHT_GAME ) renderer.orient_tile( x, y + 1 );
	if( y - 1 >= 0 ) renderer.orient_tile( x, y - 1 );
	if( x + 1 < TWIDTH_GAME ) renderer.orient_tile( x + 1, y );
	if( x - 1 >= 0 ) renderer.draw_tile( x - 1, y );
	if( y + 1 < THEIGHT_GAME ) renderer.draw_tile( x, y + 1 );
	if( y - 1 >= 0 ) renderer.draw_tile( x, y - 1 );
	if( x + 1 < TWIDTH_GAME ) renderer.draw_tile( x + 1, y );
}

function update_loop( ts ) {
	update_boss( ts );
	update_players( ts );
	if( !SERVER ) {
		draw_viewport( ts );
		cursor_x = ( cursor_vx + view_x );
		cursor_y = ( cursor_vy + view_y );
		if( LEFT_MB_DOWN ) {
			var tile_x = Math.floor( cursor_x / 8 );
			var tile_y = Math.floor( cursor_y / 8 );
			console.log( tile_x, tile_y );
			if( get_tile( tile_x, tile_y ) != 0 ) {
				break_tile( tile_x, tile_y );
				conn.send( JSON.stringify( { "action" : "break", "id" : me.id, "x" : tile_x, "y" : tile_y } ) );
			}
		} else if( RIGHT_MB_DOWN ) {
			var tile_x = Math.floor( cursor_x / 8 );
			var tile_y = Math.floor( cursor_x / 8 );

		}
		if( last_send == -1 ) last_send = ts;
		if( ts - last_send > 50 ) {
			conn.send( JSON.stringify( { "action" : "update", "id" : me.id, "player" : serialize_player( players[ me.id ] ) } ) );
			last_send = ts;
		}
	}
	window.requestAnimationFrame( update_loop );
}

function handle_mousemove( e ) {
	var rect = this.getBoundingClientRect();
	cursor_vx = ( ( e.clientX - rect.left ) / rect.width * WIDTH_VIEWPORT ) | 0;
	cursor_vy = ( ( e.clientY - rect.top ) / rect.height * HEIGHT_VIEWPORT ) | 0;
}

function handle_mousedown( e ) {
	switch( e.which ) {
		case 1: // left
			LEFT_MB_DOWN = true;
			break;
		case 2: // middle
			MID_MB_DOWN = true;
			break;
		case 3: // right
			RIGHT_MB_DOWN = true;
			break;
	}
}

function handle_mouseup( e ) {
	switch( e.which ) {
		case 1: // left
			LEFT_MB_DOWN = false;
			break;
		case 2: // middle
			MID_MB_DOWN = false;
			break;
		case 3: // right
			RIGHT_MB_DOWN = false;
			break;
	}
}

function handle_keydown( evt ) {
	keys[ evt.keyCode ] = true;
}

function handle_keyup( evt ) {
	keys[ evt.keyCode ] = false;
}

function handle_contextmenu( e ) {
	e.preventDefault();
	return false;
}

function callback_render_tiles( evt ) {
	renderer = evt;
	tile_canvas = evt.canvas;
	document.addEventListener( "keydown", handle_keydown );
	document.addEventListener( "keyup", handle_keyup );
	game_canvas.addEventListener( "mousemove", handle_mousemove );
	game_canvas.addEventListener( "mousedown", handle_mousedown );
	game_canvas.addEventListener( "mouseup", handle_mouseup );
	game_canvas.addEventListener( "contextmenu", handle_contextmenu );
	window.requestAnimationFrame( update_loop );
}

function callback_gen( evt ) {
	tiles = evt.tiles;
	TWIDTH_GAME = tiles[ 0 ].length;
	THEIGHT_GAME = tiles.length;
	WIDTH_GAME = TWIDTH_GAME * WIDTH_TILE;
	HEIGHT_GAME = THEIGHT_GAME * HEIGHT_TILE;
	init_render_tiles( callback_render_tiles, tiles );
}

function callback_server( evt ) {
	conn = evt;
	init_gen( callback_gen, 0xFFFF );
}

function callback_client( evt ) {
	conn = evt;
	conn.send( JSON.stringify( { "action" : "join" } ) );
}

function serialize_player( player ) {
	var data = {};
	data.ent = player.ent;
	data.flight_time = player.flight_time;
	data.time_jump = player.time_jump;
	data.flying = player.flying;
	data.alive = player.alive;
	return data;
}

function handle_msg( channel, msg ) {	
	var data = JSON.parse( msg );
	if( SERVER ) {
		switch( data.action ) {
			case "join":
				for( var i = 0; i < 4; ++i ) {
					if( players[ i ].active == false ) {
						players[ i ].active = true;
						players[ i ].alive = true;
						console.log(JSON.stringify( { "action" : "join", "data" : i, width : TWIDTH_GAME } ));
						channel.send( JSON.stringify( { "action" : "join", "data" : i, "height" : THEIGHT_GAME } ) );
						for( var y = 0; y < THEIGHT_GAME; ++y ) {
							channel.send( JSON.stringify( { "action" : "tiles", "y" : y, "row" : tiles[ y ] } ) );
						}
						return;
					}
				}
				channel.send( JSON.stringify( { "action" : "join", "data" : -1 } ) );
				break;
			case "break":
				tiles[ data.y ][ data.x ] = 0;
				conn.send( msg );
				break;
			case "joined":
				conn.send( JSON.stringify( { "action" : "joined", "id" : data.id } ) );
				players[ data.id ].active = true;
				players[ data.id ].alive = true;
				break;
			case "update":
				var player = players[ data.id ];
				data = data.player;
				player.ent.x = data.ent.x;
				player.ent.y = data.ent.y;
				player.ent.dx = data.ent.dx;
				player.ent.dy = data.ent.dy;
				player.ent.width = data.ent.width;
				player.ent.height = data.ent.height;
				player.ent.direction = data.ent.direction;
				player.flight_time = data.flight_time;
				player.time_jump = data.time_jump;
				player.flying = data.flying;
				player.alive = data.alive;
				player.active = true;
				conn.send( msg );
			default:
				break;
		}
	} else {
		switch( data.action ) {
			case "join":
				if( data.data == -1 ) {

				} else {
					me = new Me( data.data );
					players[ data.data ].active = true;
					players[ data.data ].alive = true;
					THEIGHT_GAME = data.height;
					tiles = [];
					for( var y = 0; y < THEIGHT_GAME; ++y ) tiles.push( null );
				}
				break;
			case "break":
				if( data.id == me.id ) return;
				break_tile( data.x, data.y );
				break;
			case "tiles":
				tiles[ data.y ] = data.row;
				TWIDTH_GAME = data.row.length;
				WIDTH_GAME = TWIDTH_GAME * WIDTH_TILE;
				HEIGHT_GAME = THEIGHT_GAME * HEIGHT_TILE;
				if( ++received == THEIGHT_GAME ) {
					conn.send( JSON.stringify( { "action" : "joined", "id" : me.id } ) );
				}
				break;
			case "joined":
				if( data.id == me.id ) {
					init_render_tiles( callback_render_tiles, tiles );
				} else {
					players[ data.id ].active = true;
					players[ data.id ].alive = true;
				}
				break;
			case "update":
				if( data.id == me.id ) return;
				var player = players[ data.id ];
				data = data.player;
				player.ent.x = data.ent.x;
				player.ent.y = data.ent.y;
				player.ent.dx = data.ent.dx;
				player.ent.dy = data.ent.dy;
				player.ent.width = data.ent.width;
				player.ent.height = data.ent.height;
				player.ent.direction = data.ent.direction;
				player.flight_time = data.flight_time;
				player.time_jump = data.time_jump;
				player.flying = data.flying;
				player.alive = data.alive;
				player.active = true;
			default:
				break;
		}
	}
}

function callback_anim( evt ) {
	anim = evt;
	anims_idle[ 0 ] = anim.IDLE_1;
	anims_idle[ 1 ] = anim.IDLE_2;
	anims_idle[ 2 ] = anim.IDLE_3;
	anims_idle[ 3 ] = anim.IDLE_4;
	anims_run[ 0 ] = anim.RUN_1;
	anims_run[ 1 ] = anim.RUN_2;
	anims_run[ 2 ] = anim.RUN_3;
	anims_run[ 3 ] = anim.RUN_4;
	anims_glide[ 0 ] = anim.GLIDE_1;
	anims_glide[ 1 ] = anim.GLIDE_2;
	anims_glide[ 2 ] = anim.GLIDE_3;
	anims_glide[ 3 ] = anim.GLIDE_4;
	anims_flap[ 0 ] = anim.FLAP_1;
	anims_flap[ 1 ] = anim.FLAP_2;
	anims_flap[ 2 ] = anim.FLAP_3;
	anims_flap[ 3 ] = anim.FLAP_4;
	init_players();
	init_projectiles();
	if( SERVER ) {
		init_server( callback_server, handle_msg );
	} else {
		init_client( callback_client, handle_msg );
	}
}

init_anim( callback_anim );