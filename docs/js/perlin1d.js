function init_perlin_1d( cb ) {
	var CALLBACK = cb,
		TABLE_SIZE = 255;

	var evt = {},
		gradients = [],
		permutations = [],
		temp,
		idx,
		i;

	for( i = 0; i < TABLE_SIZE; ++i ) {
		gradients.push( Math.random() * 2 - 1 );
		permutations.push( i );
	}

	for( i = 0; i < TABLE_SIZE; ++i ) {
		temp = permutations[ i ];
		idx = ( Math.random() * TABLE_SIZE ) | 0;
		permutations[ i ] = permutations[ idx ];
		permutations[ idx ] = temp;
	}

	function hash_pos( x ) {
		return permutations[ x % TABLE_SIZE ];
	}

	function smooth_step( x ) {
		return ( x ** 3 ) * ( x * ( x * 6 - 15 ) + 10 );
	}

	function linterpolate( a, b, weight ) {
		return a + weight * ( b - a );
	}

	function perlin_at( x ) {
		var lx = x | 0;
		var rx = lx + 1;
		var xd = x - ( x | 0 );
		var weight = smooth_step( xd );
		var l = gradients[ hash_pos( lx ) ];
		var r = gradients[ hash_pos( rx ) ];
		var ld = xd;
		var rd = xd - 1;
		return linterpolate( ld * l, rd * r, weight );
	}

	evt.noise_at = perlin_at;
	CALLBACK( evt );
}