function init_perlin_2d( cb ) {
	var CALLBACK = cb,
		TABLE_SIZE = 255;

	var evt = {},
		gradients = [],
		permutations = [];

	function init_gradient() {
		var i,
			x, 
			y,
			l;
		for( i = 0; i < TABLE_SIZE; ++i ) {
			x = Math.random() * 2 - 1;
			y = Math.random() * 2 - 1;
			l = Math.sqrt( x * x + y * y );
			x /= l;
			y /= l;
			gradients.push( x );
			gradients.push( y );
			permutations.push( i );
		}
	}

	function init_perm() {
		var i,
			idx,
			temp;
		for( i = 0; i < TABLE_SIZE; ++i ) {
			temp = permutations[ i ];
			idx = ( Math.random() * TABLE_SIZE ) | 0;
			permutations[ i ] = permutations[ idx ];
			permutations[ idx ] = temp;
		}
		for( i = 0; i < TABLE_SIZE; ++i ) {
			permutations.push( permutations[ i ] );
		}
	}

	function hash_pos( x, y ) {
		return permutations[ ( permutations[ x % TABLE_SIZE ] + y ) % TABLE_SIZE ];
	}

	function smooth_step( x ) {
		return ( x ** 3 ) * ( x * ( x * 6 - 15 ) + 10 );
	}

	function linterpolate( a, b, weight ) {
		return a + weight * ( b - a );
	}

	function perlin_at( x, y ) {
		var lx = x | 0;
		var ty = y | 0;
		var rx = ( lx + 1 );
		var by = ( ty + 1 );
		var xd = x - ( x | 0 );
		var yd = y - ( y | 0 );
		var xweight = smooth_step( xd );
		var yweight = smooth_step( yd );
		var tl_x = gradients[ 2 * hash_pos( lx, ty ) ];
		var tl_y = gradients[ 2 * hash_pos( lx, ty ) + 1 ];
		var tr_x = gradients[ 2 * hash_pos( rx, ty ) ];
		var tr_y = gradients[ 2 * hash_pos( rx, ty ) + 1 ];
		var bl_x = gradients[ 2 * hash_pos( lx, by ) ];
		var bl_y = gradients[ 2 * hash_pos( lx, by ) + 1 ];
		var br_x = gradients[ 2 * hash_pos( rx, by ) ];
		var br_y = gradients[ 2 * hash_pos( rx, by ) + 1 ];
		var ld = xd;
		var rd = xd - 1;
		var td = yd;
		var bd = yd - 1;
		var t = linterpolate( tl_x * ld + tl_y * td, tr_x * rd + tr_y * td, xweight ); 
		var b = linterpolate( bl_x * ld + bl_y * bd, br_x * rd + br_y * bd, xweight ); 
		return linterpolate( t, b, yweight );
	}

	init_gradient();
	init_perm();
	evt.noise_at = perlin_at;
	CALLBACK( evt );
}