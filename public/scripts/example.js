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
        return { messages: [] };
    },
    componentDidMount: function componentDidMount() {

        console.log(this.props.channel);
        socket.emit('chat connect', {
            token: 'randomOtherId'
        });

        socket.on('chat message', this._addMessage);

    },
    _filterMessages: function filterMessages(messages) {
        messages.filter(function(message) {
            return this.props.channel === message.channel;
        });
    },
    _addMessage: function addMessage(message) {
        var comments = this.state.messages;
        comments.push(message);
        console.log(this.state);
        this.setState({ messages: comments });
    },
    render: function() {
      var counter = 0;
        var messageNodes = this.state.messages.map(function(message) {
          counter++;
            return (
                    <Message user = { message.user } key= { counter } message = { message.message }> { message.message }
                    </Message>
                );
        });

        return ( <div className = "commentBox" >
            <h1> Comments </h1>
                {messageNodes}
            </div>
        );
    }
});

ReactDOM.render( <CommentBox channel = "all" /> ,
    document.getElementById('content')
);
