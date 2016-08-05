var socket = io('http://localhost:3000');

var Message = React.createClass({
	render: function() {
		return(
			<div className="message">
                <p><b>{ this.props.user}:</b><i>{this.props.message}</i></p>
          </div>
		)
	}
});

var ChannelTitle = React.createClass({
	render: function() {
		if(this.props.title === null) return null;

		return(
			<h1>{this.props.title}</h1>
		)
	}
});

var Channel = React.createClass({
	render: function() {
		return(
			<li>
            <div onClick={this.props.onClick} className="channel">
              <p><b>{ this.props.channelName}:</b><i>{this.props.unread}</i></p>
            </div>
          </li>
		)
	}
});

var ChannelList = React.createClass({
	changeChannel: function(channel) {
		this.props.onChannelChange(channel);
	},

	_addChannel(channelTitle, key, boundClick, channel) {
		return [<ChannelTitle title = {channelTitle} />, <Channel onClick = {boundClick} channelName={ channel.name } key = {key} unread= { channel.unread } />];
	},
	_getChannelTitle: function(foundTypes,channel) {


		if(foundTypes.indexOf(channel.type) === -1) {
			foundTypes.push(channel.type);
			return channel.type;
		}
    return null;
	},
	render: function() {
		var foundTypes = [];

    var allChannels = Object.keys(this.props.channels);
		var channelCounter = 0;
    var allMessages = [];
    var messages = {};



		allChannels.forEach((channelKey) => {
			channelCounter++;
			var channel = this.props.channels[channelKey];
			var boundClick = this.changeChannel.bind(this, channel.name);
      var channelTitle = this._getChannelTitle(foundTypes,channel);
      var channelType = channel.type;

      if(!messages.hasOwnProperty(channelType)){
        messages[channelType] = [];
      }
      console.log(channelTitle);
      messages[channelType].push(this._addChannel(channelTitle, channelCounter, boundClick, channel));
		});
    Object.keys(messages).forEach((channelKey) => {
      messages[channelKey].forEach((message) => {
          allMessages.push(message);
      });
    });
    console.log(allMessages);
		return(
			<div className ="sidebar">
          <ul>
            {allMessages}
          </ul>
      </div>
		);
	}
});
var MessageList = React.createClass({
	render: function() {
		var counter = 0;
		var messageNodes = this.props.messages.map(function(message) {

			counter++;
			return(
				<Message user = { message.user } key= { counter } message = { message.message }> { message.message }
                </Message>
			);

		});
		return(
			<div className="chatWindow">
          {messageNodes}
      </div>
		)
	}
});
var ReactApp = React.createClass({
	getInitialState: function getInitialState() {
		return {
			messages: {
				currentChannel: "global",
				channels: {
					Global: {
						type: 'channel',
						name: 'Global',
						messages: [],
						unread: 0,
					}
				}
			}
		};

	},
	componentDidMount: function componentDidMount() {
		socket.emit('chat connect', {
			token: 'randomOtherId'
		});
		socket.on('chat message', this._addMessage);
	},
	_setChannel(channel) {
		var currentState = this.state;

		currentState.messages.currentChannel = channel;
		currentState.messages.channels[channel].unread = 0;
		this.setState(currentState);
	},
	_addMessage: function addMessage(message) {
		var data = this.state;
		var channelKey = message.channel;

		if(channelKey == 'From' || channelKey == 'To') {
			channelKey = message.user;
		}
		if(channelKey == '') {
			channelKey = 'global';
		}

		data = this._addMessageToChannel(data, channelKey, message);

		this.setState(data);


	},
	_addMessageToChannel: function addMessageToChannel(data, channelKey, message) {

		var channelType = 'channel';
		if(message.team !== '') {
			channelKey = message.team;
			channelType = 'team';
		}

		if(!data.messages.channels.hasOwnProperty(channelKey)) {
			data.messages.channels[channelKey] = {
				name: channelKey,
				type: channelType,
				messages: [],
				unread: 0
			};
		}



		data.messages.channels[channelKey].messages.push(message);

		var unreadMessages = data.messages.channels[channelKey].unread;

		if(data.messages.currentChannel != channelKey) {
			data.messages.channels[channelKey].unread = unreadMessages + 1;
		}

		return data;
	},
	render: function() {
		var currentChannel = this.state.messages.currentChannel;
		var channels = this.state.messages.channels;
		var messages = [];

		if(channels.hasOwnProperty(currentChannel)) {
			messages = channels[currentChannel].messages;
		}
		return(
			<div className = "ReactApp" >
                <ChannelList currentChannel={ currentChannel } onChannelChange = { this._setChannel } channels= {channels} />
                <MessageList messages = {messages} />
            </div>
		);
	}
});

ReactDOM.render(<ReactApp channel = "Party" />,
	document.getElementById('content')
);

socket.emit('chat message', {
	message: 'Hello React',
	channel: 'Party',
	user: 'Holy_sheep',
	team: '',
	rank: 'MVP+'
});
socket.emit('chat message', {
	message: 'Hello Guild Chat',
	channel: 'Guild',
	user: 'Holy_Sheep',
	team: '',
	rank: 'VIP+'
});
socket.emit('chat message', {
	message: 'Oi Holy_Sheep',
	channel: 'Guild',
	user: 'Craftacar',
	team: '',
	rank: 'VIP+'
});
socket.emit('chat message', {
	message: 'Oi Holy_Sheep',
	channel: '',
	user: 'Randy123',
	team: 'teamABC',
	rank: ''
});
socket.emit('chat message', {
	message: 'Oi Holy_Sheep',
	channel: 'Guild',
	user: 'Craftacar',
	team: 'teamABC',
	rank: 'VIP+'
});
