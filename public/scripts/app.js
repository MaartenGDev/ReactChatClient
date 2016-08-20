var socket = io('http://localhost:3000');

var Message = React.createClass({
	render: function() {
		var messageDate = this.props.date;
		var minutes =  messageDate.getMinutes() > 9 ?  messageDate.getMinutes() : "0" +  messageDate.getMinutes();

		var date = messageDate.getHours() + ':' + minutes;

		return(
			<div className="message">
						<ProfileImage size="40" user= { this.props.user }></ProfileImage>
						<div className="message-details">
            	<p className = "message-user"><b>{ this.props.user}</b> <span className="message-date">{date}</span></p>
							<p className = "message-data">{this.props.message}</p>
						</div>
      </div>
		)
	}
});
var UnreadChip = React.createClass({
	render: function(){
		return this.props.unread > 0 ? <span className="unread-chip">{this.props.unread}</span> : null;
	}
});

var ChannelTitle = React.createClass({
	render: function() {
		if(this.props.title === null) return null;

		return(
			<p className="group-title">{this.props.title}</p>
		)
	}
});
var ProfileImage = React.createClass({
	render: function() {
		return (
			<img className="message-user-image" src={"https://crafatar.com/avatars/"+ this.props.user + "?size=" + this.props.size } />
		)
	}
});

var Channel = React.createClass({
	render: function() {
		return(
			<li className="channel-name">
          <div onClick={this.props.onClick} className="channel">
            <p>{ this.props.channelName} <UnreadChip unread= {this.props.unread }/></p>
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
      messages[channelType].push(this._addChannel(channelTitle, channelCounter, boundClick, channel));
		});
    Object.keys(messages).forEach((channelKey) => {
      messages[channelKey].forEach((message) => {
          allMessages.push(message);
      });
    });
		return(
			<div className ="sidebar">
          <ul className="channel-list">
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
				<Message date = { message.date } user = { message.user } key= { counter } message = { message.message }> { message.message }</Message>
			);

		});
		return(
			<div className="chat-window">
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

		message.date = new Date();
		if(channelKey == '') {
			channelKey = 'global';
		}

		data = this._addMessageToChannel(data, channelKey, message);

		this.setState(data);
	},
	_addMessageToChannel: function addMessageToChannel(data, channelKey, message) {
		var channelType = 'channels';
		if(message.channel === 'To' || message.channel === 'From'){
				channelKey = message.user;
				channelType = 'users';
		}
		if(typeof message.group !== 'undefined' && message.group !== '') {
			channelKey = message.group.replace('[','').replace(']','').toLowerCase();
			channelType = 'teams';

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
