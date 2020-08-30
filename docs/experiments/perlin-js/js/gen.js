var WIDTH = 480,
	HEIGHT = 720;

var GEN_STEP_CAVE = 0.12,
	GEN_STEP_HILL = 0.06,
	GEN_AMP_HILL = 30,
	GEN_THRESH_CAVE = 0.19,
	GEN_START_CAVES = 360;

var canvas = document.getElementById( "gen" ),
	ctx,
	perlin1d,
	perlin2d;

canvas.width = WIDTH;
canvas.height = HEIGHT;
ctx = canvas.getContext( "2d" );

var tiles = [];

function init_tiles() {
	var i, j;
	for( j = 0; j < HEIGHT; ++j ) {
		tiles.push( [] );
		for( i = 0; i < WIDTH; ++i ) {
			tiles[ j ].push( 0 );
		}
	}
}

function render_tiles() {
	var x, y;
	for( y = 0; y < HEIGHT; ++y ) {
		for( x = 0; x < WIDTH; ++x ) {
			if( tiles[ y ][ x ] == 1 )
				ctx.fillRect( x, y, 1, 1 );
		}
	}
}

function gen_hills() {
	var x, y, noise, tip_y;
	for( x = 0; x < WIDTH; ++x ) {
		noise = perlin1d.noise_at( x * GEN_STEP_HILL );
		tip_y = GEN_START_CAVES + ( ( noise * GEN_AMP_HILL ) | 0 );
		for( y = 0; y < tip_y; ++y ) {
			tiles[ y ][ x ] = 0;
		}
		y = tip_y;
		while( y < HEIGHT && tiles[ y ][ x ] != 1 ) {
			tiles[ y++ ][ x ] = 1;
		}
	}
	render_tiles();
}

function gen_caves() {
	var x, y, noise;
	for( y = GEN_START_CAVES; y < HEIGHT; ++y ) {
		for( x = 0; x < WIDTH; ++x ) {
			noise = perlin2d.noise_at( x * GEN_STEP_CAVE, y * GEN_STEP_CAVE );
			if( noise < GEN_THRESH_CAVE ) {
				tiles[ y ][ x ] = 1;
			}
		}
	}
	gen_hills();
}

function callback_2d( evt ) {
	perlin2d = evt;
	gen_caves();
}

function callback_1d( evt ) {
	perlin1d = evt;
	init_perlin_2d( callback_2d );
}

init_tiles();
init_perlin_1d( callback_1d );