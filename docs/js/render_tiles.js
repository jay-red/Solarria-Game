function init_render_tiles( cb, t, s ) {
	var CALLBACK = cb,
		SEED = s,
		WIDTH_TILES = t[ 0 ].length,
		HEIGHT_TILES = t.length,
		WIDTH_TILE = 8,
		HEIGHT_TILE = 8,
		SIZE_TILE = 8,
		IMG_GRASS = new Image(),
		IMG_SAND = new Image(),
		IMG_STONE = new Image()
		ASSETS = [];

	var tiles = t,
		evt = {},
		loaded = 0,
		tile_canvas = document.createElement( "canvas" ),
		tile_ctx,
		width_;

	tile_canvas.height = HEIGHT_TILES * HEIGHT_TILE;
	tile_canvas.width = WIDTH_TILES * WIDTH_TILE;
	tile_ctx = tile_canvas.getContext( "2d" );

	function draw_tile( x, y ) {
		var tile = tiles[ y ][ x ];
		if( tile == 0 ) return;
		var idx = ( tile >> 8 ) & 0xF;
		var v = ( tile >> 12 ) & 0xF;
		var ty = ( idx / 4 ) | 0;
		var tx = idx & 0x3;
		tile = ( tile & 0xFF ) - 1;
		if( idx == 0 ) {
			tile_ctx.fillStyle = "#1b213d";
			if( v == 0 ) {
				tile_ctx.fillRect( x * WIDTH_TILE, y * HEIGHT_TILE, WIDTH_TILE, HEIGHT_TILE );
			} else {
				tile_ctx.drawImage( ASSETS[ tile ], tx * WIDTH_TILE, ty * HEIGHT_TILE, WIDTH_TILE, HEIGHT_TILE, x * WIDTH_TILE, y * HEIGHT_TILE, WIDTH_TILE, HEIGHT_TILE );
			}
		} else {
			tile_ctx.drawImage( ASSETS[ tile ], tx * WIDTH_TILE, ty * HEIGHT_TILE, WIDTH_TILE, HEIGHT_TILE, x * WIDTH_TILE, y * HEIGHT_TILE, WIDTH_TILE, HEIGHT_TILE );
		}
	}

	function orient_tile( x, y ) {
		var tile = tiles[ y ][ x ],
			adj = 0;
		tiles[ y ][ x ] &= 0xFFFFFCFF;
		if( tile == 0 ) return;
		var up, right, down, left, u, r, d, l;
		up = right = down = left = false;
		u = r = d = l = -1;
		if( y - 1 >= 0 ) u = tiles[ y - 1 ][ x ] & 0xFF;
		if( x + 1 < WIDTH_TILES ) r = tiles[ y ][ x + 1 ] & 0xFF;
		if( y + 1 < HEIGHT_TILES ) d = tiles[ y + 1 ][ x ] & 0xFF;
		if( x - 1 >= 0 ) l = tiles[ y ][ x - 1 ] & 0xFF;
		if( u > 0 && ++adj ) up = true;
		if( r > 0 && ++adj ) right = true;
		if( d > 0 && ++adj ) down = true;
		if( l > 0 && ++adj ) left = true;
		if( adj == 0 ) {
			tiles[ y ][ x ] |= ( 0xF << 8 );
		} else if( adj == 1 ) {
			if( up ) tiles[ y ][ x ] |= ( 0xD << 8 );
			else if( right ) tiles[ y ][ x ] |= ( 0xE << 8 );
			else if( down ) tiles[ y ][ x ] |= ( 0xB << 8 );
			else if( left ) tiles[ y ][ x ] |= ( 0xC << 8 );
		} else if( adj == 2 ) {
			if( right && down ) tiles[ y ][ x ] |= ( 0x5 << 8 );
			else if( left && down ) tiles[ y ][ x ] |= ( 0x6 << 8 );
			else if( left && up ) tiles[ y ][ x ] |= ( 0x7 << 8 );
			else if( right && up ) tiles[ y ][ x ] |= ( 0x8 << 8 );
			else if( left && right ) tiles[ y ][ x ] |= ( 0x9 << 8 );
			else if( up && down ) tiles[ y ][ x ] |= ( 0xA << 8 );
		} else if( adj == 3 ) {
			if( !up ) tiles[ y ][ x ] |= ( 0x1 << 8 );
			else if( !right ) tiles[ y ][ x ] |= ( 0x2 << 8 );
			else if( !down ) tiles[ y ][ x ] |= ( 0x3 << 8 );
			else if( !left ) tiles[ y ][ x ] |= ( 0x4 << 8 );
		} 
	}

	function callback_loaded() {
		var x, y;
		for( y = 0; y < HEIGHT_TILES; ++y ) {
			for( x = 0; x < WIDTH_TILES; ++x ) {
				orient_tile( x, y );
				if( tiles[ y ][ x ] != 0 ) {
					if( ( ( Math.random() * 50 ) | 0 ) == 0 ) {
						tiles[ y ][ x ] |= 1 << 12;
					} else {
						tiles[ y ][ x ] |= 0;
					}
				}
				draw_tile( x, y );
			}
		}
		evt[ "canvas" ] = tile_canvas;
		CALLBACK( evt );
	}

	ASSETS.push( IMG_GRASS );
	ASSETS.push( IMG_SAND );
	ASSETS.push( IMG_STONE );

	function callback_load() {
		if( ++loaded == ASSETS.length ) {
			callback_loaded();
		}
	}

	IMG_GRASS.addEventListener( "load", callback_load );
	IMG_SAND.addEventListener( "load", callback_load );
	IMG_STONE.addEventListener( "load", callback_load );

	IMG_GRASS.src = "assets/tile_grass.png";
	IMG_SAND.src = "assets/tile_sand.png";
	IMG_STONE.src = "assets/tile_stone.png";
}