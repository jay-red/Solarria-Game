function init_anim( cb ) {
	var CALLBACK = cb,
		evt = {},
		total = 0,
		loaded = 0;

	function Sprite( x, y ) {
		this.img = new Image();
		this.top = y;
		this.left = x;
		++total;
	}

	var DELAY_IDLE = 150,
		DELAY_RUN = 120,
		DELAY_GLIDE = 150,
		DELAY_FLAP = 150;

	var DELAY_IDLE_BOSS = 120,
		DELAY_ATTACK_BOSS = 120;

	var IMG_IDLE_L_BOSS = new Sprite( 45, 50 ),
		IMG_IDLE_R_BOSS = new Sprite( 75, 50 ),
		IMG_ATTACK_L_BOSS = new Sprite( 118, 92 ),
		IMG_ATTACK_R_BOSS = new Sprite( 82, 92 );

	var IMG_IDLE_L_1 = new Sprite( 8, 6 ),
		IMG_IDLE_R_1 = new Sprite( 10, 6 ),
		IMG_RUN_L_1 = new Sprite( 9, 6 ),
		IMG_RUN_R_1 = new Sprite( 9, 6 ),
		IMG_GLIDE_L_1 = new Sprite( 8, 6 ),
		IMG_GLIDE_R_1 = new Sprite( 10, 6 ),
		IMG_FLAP_L_1 = new Sprite( 8, 6 ),
		IMG_FLAP_R_1 = new Sprite( 10, 6 );

	var IMG_IDLE_L_2 = new Sprite( 8, 6 ),
		IMG_IDLE_R_2 = new Sprite( 10, 6 ),
		IMG_RUN_L_2 = new Sprite( 9, 6 ),
		IMG_RUN_R_2 = new Sprite( 9, 6 ),
		IMG_GLIDE_L_2 = new Sprite( 8, 6 ),
		IMG_GLIDE_R_2 = new Sprite( 10, 6 ),
		IMG_FLAP_L_2 = new Sprite( 8, 6 ),
		IMG_FLAP_R_2 = new Sprite( 10, 6 );

	var IMG_IDLE_L_3 = new Sprite( 8, 6 ),
		IMG_IDLE_R_3 = new Sprite( 10, 6 ),
		IMG_RUN_L_3 = new Sprite( 9, 6 ),
		IMG_RUN_R_3 = new Sprite( 9, 6 ),
		IMG_GLIDE_L_3 = new Sprite( 8, 6 ),
		IMG_GLIDE_R_3 = new Sprite( 10, 6 ),
		IMG_FLAP_L_3 = new Sprite( 8, 6 ),
		IMG_FLAP_R_3 = new Sprite( 10, 6 );

	var IMG_IDLE_L_4 = new Sprite( 8, 6 ),
		IMG_IDLE_R_4 = new Sprite( 10, 6 ),
		IMG_RUN_L_4 = new Sprite( 9, 6 ),
		IMG_RUN_R_4 = new Sprite( 9, 6 ),
		IMG_GLIDE_L_4 = new Sprite( 8, 6 ),
		IMG_GLIDE_R_4 = new Sprite( 10, 6 ),
		IMG_FLAP_L_4 = new Sprite( 8, 6 ),
		IMG_FLAP_R_4 = new Sprite( 10, 6 );

	function callback_img() {
		if( ( ++loaded ) == total ) {
			CALLBACK( evt );
		}
	}

	function callback_img_load() {
		callback_img();
	}

	function callback_img_error() {
		callback_img();		
	}

	function set_source( sprite, name ) {
		sprite.img.addEventListener( "load", callback_img_load );
		sprite.img.addEventListener( "error", callback_img_error );
		sprite.img.src = "assets/" + name + ".png";
	}

	function Animation( l, r, u, d, f, t, w, h ) {
		this.assets = [ l, r, u, d ];
		this.frames = f;
		this.delay = t;
		this.width = w;
		this.height = h;
	}

	var ANIM_IDLE_BOSS = new Animation( IMG_IDLE_L_BOSS, IMG_IDLE_R_BOSS, null, null, 6, DELAY_IDLE_BOSS, 160, 144 ),
		ANIM_ATTACK_BOSS = new Animation( IMG_ATTACK_L_BOSS, IMG_ATTACK_R_BOSS, null, null, 11, DELAY_ATTACK_BOSS, 240, 192 );

	var ANIM_IDLE_1 = new Animation( IMG_IDLE_L_1, IMG_IDLE_R_1, null, null, 4, DELAY_IDLE, 24, 24 ),
		ANIM_IDLE_2 = new Animation( IMG_IDLE_L_2, IMG_IDLE_R_2, null, null, 4, DELAY_IDLE, 24, 24 ),
		ANIM_IDLE_3 = new Animation( IMG_IDLE_L_3, IMG_IDLE_R_3, null, null, 4, DELAY_IDLE, 24, 24 ),
		ANIM_IDLE_4 = new Animation( IMG_IDLE_L_4, IMG_IDLE_R_4, null, null, 4, DELAY_IDLE, 24, 24 );

	var ANIM_RUN_1 = new Animation( IMG_RUN_L_1, IMG_RUN_R_1, null, null, 6, DELAY_RUN, 24, 24 ),
		ANIM_RUN_2 = new Animation( IMG_RUN_L_2, IMG_RUN_R_2, null, null, 6, DELAY_RUN, 24, 24 ),
		ANIM_RUN_3 = new Animation( IMG_RUN_L_3, IMG_RUN_R_3, null, null, 6, DELAY_RUN, 24, 24 ),
		ANIM_RUN_4 = new Animation( IMG_RUN_L_4, IMG_RUN_R_4, null, null, 6, DELAY_RUN, 24, 24 );

	var ANIM_GLIDE_1 = new Animation( IMG_GLIDE_L_1, IMG_GLIDE_R_1, null, null, 4, DELAY_GLIDE, 24, 24 ),
		ANIM_GLIDE_2 = new Animation( IMG_GLIDE_L_2, IMG_GLIDE_R_2, null, null, 4, DELAY_GLIDE, 24, 24 ),
		ANIM_GLIDE_3 = new Animation( IMG_GLIDE_L_3, IMG_GLIDE_R_3, null, null, 4, DELAY_GLIDE, 24, 24 ),
		ANIM_GLIDE_4 = new Animation( IMG_GLIDE_L_4, IMG_GLIDE_R_4, null, null, 4, DELAY_GLIDE, 24, 24 );

	var ANIM_FLAP_1 = new Animation( IMG_FLAP_L_1, IMG_FLAP_R_1, null, null, 4, DELAY_FLAP, 24, 24 ),
		ANIM_FLAP_2 = new Animation( IMG_FLAP_L_2, IMG_FLAP_R_2, null, null, 4, DELAY_FLAP, 24, 24 ),
		ANIM_FLAP_3 = new Animation( IMG_FLAP_L_3, IMG_FLAP_R_3, null, null, 4, DELAY_FLAP, 24, 24 ),
		ANIM_FLAP_4 = new Animation( IMG_FLAP_L_4, IMG_FLAP_R_4, null, null, 4, DELAY_FLAP, 24, 24 );

	evt.IDLE_BOSS = ANIM_IDLE_BOSS;
	evt.IDLE_ATTACK_BOSS = ANIM_ATTACK_BOSS;

	evt.IDLE_1 = ANIM_IDLE_1;
	evt.IDLE_2 = ANIM_IDLE_2;
	evt.IDLE_3 = ANIM_IDLE_3;
	evt.IDLE_4 = ANIM_IDLE_4;

	evt.RUN_1 = ANIM_RUN_1;
	evt.RUN_2 = ANIM_RUN_2;
	evt.RUN_3 = ANIM_RUN_3;
	evt.RUN_4 = ANIM_RUN_4;

	evt.GLIDE_1 = ANIM_GLIDE_1;
	evt.GLIDE_2 = ANIM_GLIDE_2;
	evt.GLIDE_3 = ANIM_GLIDE_3;
	evt.GLIDE_4 = ANIM_GLIDE_4;

	evt.FLAP_1 = ANIM_FLAP_1;
	evt.FLAP_2 = ANIM_FLAP_2;
	evt.FLAP_3 = ANIM_FLAP_3;
	evt.FLAP_4 = ANIM_FLAP_4;

	set_source( IMG_IDLE_L_BOSS, "demon-idle-L" );
	set_source( IMG_IDLE_R_BOSS, "demon-idle-R" );
	set_source( IMG_ATTACK_L_BOSS, "demon-attack-L" );
	set_source( IMG_ATTACK_R_BOSS, "demon-attack-R" );

	set_source( IMG_IDLE_L_1, "player_idle_l_r" );
	set_source( IMG_IDLE_R_1, "player_idle_r_r" );
	set_source( IMG_RUN_L_1, "player_run_l_r" );
	set_source( IMG_RUN_R_1, "player_run_r_r" );
	set_source( IMG_GLIDE_L_1, "player_glide_l_r" );
	set_source( IMG_GLIDE_R_1, "player_glide_r_r" );
	set_source( IMG_FLAP_L_1, "player_flap_l_r" );
	set_source( IMG_FLAP_R_1, "player_flap_r_r" );

	set_source( IMG_IDLE_L_2, "player_idle_l_g" );
	set_source( IMG_IDLE_R_2, "player_idle_r_g" );
	set_source( IMG_RUN_L_2, "player_run_l_g" );
	set_source( IMG_RUN_R_2, "player_run_r_g" );
	set_source( IMG_GLIDE_L_2, "player_glide_l_g" );
	set_source( IMG_GLIDE_R_2, "player_glide_r_g" );
	set_source( IMG_FLAP_L_2, "player_flap_l_g" );
	set_source( IMG_FLAP_R_2, "player_flap_r_g" );

	set_source( IMG_IDLE_L_3, "player_idle_l_b" );
	set_source( IMG_IDLE_R_3, "player_idle_r_b" );
	set_source( IMG_RUN_L_3, "player_run_l_b" );
	set_source( IMG_RUN_R_3, "player_run_r_b" );
	set_source( IMG_GLIDE_L_3, "player_glide_l_b" );
	set_source( IMG_GLIDE_R_3, "player_glide_r_b" );
	set_source( IMG_FLAP_L_3, "player_flap_l_b" );
	set_source( IMG_FLAP_R_3, "player_flap_r_b" );

	set_source( IMG_IDLE_L_4, "player_idle_l_y" );
	set_source( IMG_IDLE_R_4, "player_idle_r_y" );
	set_source( IMG_RUN_L_4, "player_run_l_y" );
	set_source( IMG_RUN_R_4, "player_run_r_y" );
	set_source( IMG_GLIDE_L_4, "player_glide_l_y" );
	set_source( IMG_GLIDE_R_4, "player_glide_r_y" );
	set_source( IMG_FLAP_L_4, "player_flap_l_y" );
	set_source( IMG_FLAP_R_4, "player_flap_r_y" );
}