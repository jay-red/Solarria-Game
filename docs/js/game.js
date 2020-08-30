var IMG_IDLE_L_BOSS = new Image(),
	IMG_IDLE_R_BOSS = new Image(),
	IMG_ATTACK_L_BOSS = new Image(),
	IMG_ATTACK_R_BOSS = new Image();

var IMG_IDLE_L_1 = new Image(),
	IMG_IDLE_R_1 = new Image(),
	IMG_RUN_L_1 = new Image(),
	IMG_RUN_R_1 = new Image(),
	IMG_GLIDE_L_1 = new Image(),
	IMG_GLIDE_R_1 = new Image(),
	IMG_FLAP_L_1 = new Image(),
	IMG_FLAP_R_1 = new Image();

var IMG_IDLE_L_2 = new Image(),
	IMG_IDLE_R_2 = new Image(),
	IMG_RUN_L_2 = new Image(),
	IMG_RUN_R_2 = new Image(),
	IMG_GLIDE_L_2 = new Image(),
	IMG_GLIDE_R_2 = new Image(),
	IMG_FLAP_L_2 = new Image(),
	IMG_FLAP_R_2 = new Image();

var IMG_IDLE_L_3 = new Image(),
	IMG_IDLE_R_3 = new Image(),
	IMG_RUN_L_3 = new Image(),
	IMG_RUN_R_3 = new Image(),
	IMG_GLIDE_L_3 = new Image(),
	IMG_GLIDE_R_3 = new Image(),
	IMG_FLAP_L_3 = new Image(),
	IMG_FLAP_R_3 = new Image();

var IMG_IDLE_L_4 = new Image(),
	IMG_IDLE_R_4 = new Image(),
	IMG_RUN_L_4 = new Image(),
	IMG_RUN_R_4 = new Image(),
	IMG_GLIDE_L_4 = new Image(),
	IMG_GLIDE_R_4 = new Image(),
	IMG_FLAP_L_4 = new Image(),
	IMG_FLAP_R_4 = new Image();

var WIDTH_TILE = 8,
	HEIGHT_TILE = 8,
	TWIDTH_VIEWPORT = 64,
	WIDTH_VIEWPORT = TWIDTH_VIEWPORT * WIDTH_TILE,
	HEIGHT_VIEWPORT = window.screen.height * WIDTH_VIEWPORT / window.screen.width,
	HWIDTH_VIEWPORT = WIDTH_VIEWPORT >> 1,
	HHEIGHT_VIEWPORT = HEIGHT_VIEWPORT >> 1; 

var tiles, 
	tile_canvas,
	game_canvas = document.getElementByid( "game" ),
	game_ctx,
	view_x,
	view_y,
	me = -1;

game_canvas.width = WIDTH_VIEWPORT;
game_canvas.height = HEIGHT_VIEWPORT;
game_ctx = game_canvas.getContext( "2d" );

function Animation() {
	this.assets = [];
	this.top = -1;
	this.left = -1;
}

function Entity() {
	this.x = -1;
	this.y = -1;
	this.dx = -1;
	this.dy = -1;
	this.width = -1;
	this.height = -1;
	this.anim = null;
	this.frame = 0;
	this.last_anim = -1;
}

function Boss() {
	this.ent = new Entity();
	this.alive = false;
	this.active = false;
}

function Player() {
	this.ent = new Entity();
	this.alive = false;
	this.active = false;
}

var players = [];

function init_players() {
	for( var i = 0; i < 4; ++i ) players.push( new Player );
}

var projectiles = [[], [], [], []];

function init_projectiles() {
	for( var i = 0; i < 4; ++i ) players.push( new Player );
}

function draw_players() {
	var player;
	for( var i = 0; i < 4; ++i ) {
		player = players[ i ];
		if( player.active ) {
			if( player.alive ) {

			}
		}
	}
}

function draw_viewport() {
	if( me != -1 ) {
		var player = players[ me ];
		if( player.active ) {
			view_y = player.ent.y;
			view_x = player.ent.x;

		} else {
			// something is wrong
		}
	}
}

function update_loop( ts ) {
	window.requestAnimationFrame( update_loop );
}

function callback_render_tiles( evt ) {
	tile_canvas = evt.canvas;
}

function callback_gen( evt ) {
	tiles = evt.tiles;
	init_render_tiles( callback_render_tiles, tiles );
}

init_gen( callback_gen, 0xFFFF );