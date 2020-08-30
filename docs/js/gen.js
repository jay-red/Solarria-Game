function init_gen( cb, s ) {
	var WIDTH = 480,
		HEIGHT = 720;

	var GEN_STEP_CAVE = 0.08,
		GEN_STEP_HILL = 0.02,
		GEN_AMP_HILL = 80,
		GEN_THRESH_CAVE = 0.19,
		GEN_START_CAVES = 360,
		CALLBACK = cb,
		SEED = s;

	var evt = {},
		ctx,
		perlin1d,
		perlin2d;

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

	function gen_hills() {
		var x, y, noise, tip_y;
		for( x = 0; x < WIDTH; ++x ) {
			noise = perlin1d.noise_at( x * GEN_STEP_HILL );
			tip_y = GEN_START_CAVES + ( ( noise * GEN_AMP_HILL ) | 0 ) - 30;
			for( y = 0; y < tip_y; ++y ) {
				tiles[ y ][ x ] = 0;
			}
			y = tip_y;
			while( y < HEIGHT && tiles[ y ][ x ] == 0 ) {
				tiles[ y++ ][ x ] = 1;
			}
		}
		evt[ "tiles" ] = tiles;
		CALLBACK( evt );
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
}