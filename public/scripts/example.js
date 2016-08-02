var socket = io('http://localhost:3000');

socket.on('connection', function(socket) {
    socket.on('chat message', function(data) {
        console.log(data);
    });

    socket.on('chat connect', function(data) {
        console.log('connected');
        socket.join(data.token);
    });
});

var Message = React.createClass({
    render: function(){
      return (
          <div className="message">
                <p><b>{ this.props.user}:</b><i>{this.props.message}</i></p>
          </div>
      )
    }
});

var CommentBox = React.createClass({
    getInitialState: function getInitialState() {
        return {
          messages: {
            currentChannel: "global",
            channels: {
              global: []
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
    _setChannel(channel){
      var currentState = this.state;

      currentState.messages.currentChannel = channel;

      this.setState(currentState);
    },
    _addMessage: function addMessage(message) {
        var data = this.state;
        var channel = message.channel;

        if(channel == ''){
          channel = 'global';
        }

        data = this._addMessageToChannel(data,channel,message);

        this.setState(data);


    },
    _addMessageToChannel: function addMessageToChannel(data,channel,message){
      if(!data.messages.channels.hasOwnProperty(channel)){
        data.messages.channels[channel] = [];
      }

      data.messages.channels[channel].push(message);
      return data;
    },
    render: function() {
      var currentChannel = this.state.messages.currentChannel;
      var channels = this.state.messages.channels;
      var counter = 0;
        var messages = [];

        if(channels.hasOwnProperty(currentChannel)){
          messages = channels[currentChannel];
        }

        var messageNodes = messages.map(function(message) {
          counter++;
            return (
                    <Message user = { message.user } key= { counter } message = { message.message }> { message.message }
                    </Message>
                );
        });

        return (
            <div className = "commentBox" >
                <button onClick={this._setChannel.bind(this,'global')}>Global</button>
                <button onClick={this._setChannel.bind(this,'Guild')}>Guild</button>
                <button onClick={this._setChannel.bind(this,'Party')}>Party</button>
                <h1> Comments </h1>
                {messageNodes}
            </div>
        );
    }
});

ReactDOM.render( <CommentBox channel = "Party" /> ,
    document.getElementById('content')
);
