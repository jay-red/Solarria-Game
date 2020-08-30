function init_client( cb_open, cb_msg ) {
	var RTC_CFG = { 
			iceServers : [ { urls : "stun:stun2.1.google.com:19302" } ] 
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
		last_id = -1,
		rtc_id = 0,
		rtc = new RTCPeerConnection( RTC_CFG, RTC_OPT ),
		channel = null,
		key,
		evt = {};

	rtc.onicecandidate = function( evt ) {
		if( evt.candidate ) {
			var data = {};
			data[ "type" ] = "ice";
			data[ "user" ] = true;
			data[ "ice" ] = JSON.stringify( evt.candidate );
			data[ "id" ] = rtc_id++;
			data[ "key" ] = key;
			firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).push().set( data, callback_empty );
		}
	};

	function handle_channel_open() {
		cb_open( evt );
	}

	function send( msg ) {
		channel.send( msg );
	}

	evt[ "send" ] = send;

	function handle_channel_msg( evt ) {
		var msg = evt.data;
		cb_msg( channel, msg );
	}

	rtc.ondatachannel = function( evt ) {
		channel = evt.channel;
		channel.onmessage = handle_channel_msg;
		channel.onopen = handle_channel_open;
	};

	function callback_empty( e ) {

	}

	function callback_msg( snapshot ) {
		var action = snapshot.val();
		if( action.user ) return;
		if( action.id <= last_id ) return;
		last_id = action.id;
		switch( action.type ) {
			case "offer":
				rtc.setRemoteDescription( new RTCSessionDescription( JSON.parse( action.offer ) ) );
				rtc.createAnswer( { offerToReceiveAudio: 1 } ).then( function( answer ) {
					rtc.setLocalDescription( answer );
					var data = {};
					data[ "type" ] = "answer";
					data[ "user" ] = true;
					data[ "key" ] = key;
					data[ "answer" ] = JSON.stringify( answer );
					data[ "id" ] = rtc_id++;
					firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).push().set( data, callback_empty );
				}, function( err ) {} );
			case "ice":
				console.log(action.ice);
				rtc.addIceCandidate( new RTCIceCandidate( JSON.parse( action.ice ) ) );
				break;
			case "answer":
				rtc.setRemoteDescription( new RTCSessionDescription( JSON.parse( action.answer ) ) );
				break;
		}
	}

	function callback_msgs( snapshot ) {
		if( snapshot.exists() ) {
			snapshot.forEach( callback_msg );
		}
	}

	function callback_query_room( snapshot ) {
		if( snapshot.exists() ) {
			var ref = firebase.database().ref( "/servers/" + room + "/players/" ).push();
			ref.set( {
				active : true
			}, function( err ) {
				if( err ) {

				} else {
					key = ref.key;
					firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).on( "value", callback_msgs );
					var data = {};
					data[ "type" ] = "join";
					data[ "user" ] = true;
					data[ "key" ] = key;
					data[ "id" ] = rtc_id++;
					firebase.database().ref( "/servers/" + room + "/players/" + key + "/msg/" ).push().set( data, callback_empty );
				}
			} );	
		}
	}

	navigator.mediaDevices.getUserMedia( { audio: true, video: true } ).then( function() {
		firebase.database().ref( "/servers/" + room ).once( "value" ).then( callback_query_room );
	} );
}