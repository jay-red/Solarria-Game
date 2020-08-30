function init_server( cb_init, cb_msg ) {
	var RTC_CFG = { 
			iceServers : [ { urls : "stun:stun.l.google.com:19302" } ] 
		},
		RTC_OPT = {
			optional : [ { RtpDataChannels : false } ]
		},
		RTC_MEDIA = {
			optional: [],
			mandatory: {
				OfferToReceiveAudio: false,
				OfferToReceiveVideo: false
			}
		},
		URL = document.location.href;

	var room = URL.split( "?room=" )[1],
		joined = {},
		conns = {};

	function callback_empty( e ) {

	}

	function add_ice_handler( rtc ) {
		rtc.onicecandidate = function( evt ) {
			if( evt.candidate ) {
				var data = {},
					key = conns[ rtc ],
					id,
					to;
				data[ "type" ] = "ice";
				data[ "user" ] = false;
				data[ "ice" ] = JSON.stringify( evt.candidate );
				data[ "id" ] = joined[ key ].rtc_id++;
				firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).push().set( data, callback_empty );
			}
		};
	}

	function Conn( key ) {
		this.last_id = -1;
		this.rtc_id = 0;
		this.rtc = new RTCPeerConnection( RTC_CFG, RTC_OPT );
		conns[ this.rtc ] = key;
		add_ice_handler( this.rtc );
		this.channel = null;
	}

	function send( msg ) {
		var arr = Object.entries( joined );
		for( var i = 0; i < arr.length; ++i ) {
			arr[ i ][ 1 ].channel.send( msg );
		}
	}

	var evt = {};
	evt[ "send" ] = send;

	function handle_channel_open() {
		
	}

	function add_msg_handler( channel ) {
		channel.onmessage = function( evt ) {
			var msg = evt.data;
			cb_msg( channel, msg );
		}
	}

	function callback_msg( snapshot ) {
		var action = snapshot.val();
		if( !action.user ) return;
		var key = action.key;
		var conn = joined[ action.key ];
		if( action.id <= conn.last_id ) return;
		conn.last_id = action.id;
		switch( action.type ) {
			case "join":
				conn.channel = conn.rtc.createDataChannel( "game" );
				add_msg_handler( conn.channel );
				conn.rtc.createOffer( { offerToReceiveAudio : 1 } ).then( function( offer ) {
					conn.rtc.setLocalDescription( offer );
					var data = {};
					data[ "type" ] = "offer";
					data[ "user" ] = false;
					data[ "offer" ] = JSON.stringify( offer );
					data[ "id" ] = conn.rtc_id++;
					firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).push().set( data, callback_empty );
				}, function( err ) {} );
				break;
			case "ice":
				conn.rtc.addIceCandidate( new RTCIceCandidate( JSON.parse( action.ice ) ) );
				break;
			case "answer":
				conn.rtc.setRemoteDescription( new RTCSessionDescription( JSON.parse( action.answer ) ) );
				break;
		}
	}

	function callback_msgs( snapshot ) {
		if( snapshot.exists() ) {
			snapshot.forEach( callback_msg );
		}
	}

	function callback_player( snapshot ) {
		console.log( "join" );
		var key = snapshot.key;
		if( joined.hasOwnProperty( key ) ) return;
		joined[ key ] = new Conn( snapshot.key );
		firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).on( "value", callback_msgs );
	}

	function callback_players( snapshot ) {
		if( snapshot.exists() ) {
			snapshot.forEach( callback_player );
		}
	}

	function callback_query_room( snapshot ) {
		cb_init( evt );
		if( snapshot.exists() ) {
			firebase.database().ref( "/servers/" + room+ "/players/" ).on( "value", callback_players );
		} else {
			firebase.database().ref( "/servers/" + room ).set( {
				active : true
			}, function( err ) {
			    if( err ) {
			      		
			    } else {
			    	firebase.database().ref( "/servers/" + room+ "/players/" ).on( "value", callback_players );
			    }
			} );
		}
	}

	navigator.mediaDevices.getUserMedia( { audio: true, video: true } ).then( function() {
		firebase.database().ref( "/servers/" + room ).once( "value" ).then( callback_query_room );
	} );
}