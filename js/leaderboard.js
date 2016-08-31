var Leaderboard = {

  min: 0,
  divisor: 0,
  saved: 0,

  user: null,

  settings: function(min, divisor) {
    var _this = this;
    _this.min = min;
    _this.divisor = divisor;
    Bebo.User.get('me', function(err, user){
      if(err){ return console.log('error getting user for leaderboard', user) };
      _this.user = user;
    })
  },

  check: function(score) {
    var _this = this;
    if(score < _this.min){ return false };
    if(score % _this.divisor !== 0){ return false };
    if(score - _this.saved < 10){ return false };
    return true;
  },

  score: function(score) {
    var _this = this;
    if(!score){ return };
    if(!_this.user){
      Bebo.User.get('me', function(err, user){
        if(err){ return console.log('error getting user for leaderboard', user) };
        _this.user = user;
        _this.get(score);
      })
    } else {
      _this.get(score);
    }
  },

  save: function(score) {
    var _this = this;
    _this.saved = score;
    Bebo.Db.save('leaderboard', {user_id: _this.user.user_id, username: _this.user.username, score: score, id: _this.user.user_id}, function(err, resp){
      if(err){ _this.throwError('save', err) };
      _this.topten(score);
    });
  },

  getScore: function(cb) {
    var _this = this;
    Bebo.Db.get('leaderboard', {user_id: _this.user.user_id}, function(err, resp){
      if(err){ _this.throwError('get data for user', err) };
      console.log('resp', resp);
      if(resp && resp.result && resp.result[0]){
        cb(resp.result[0].score);
      } else {
        cb(0);
      }
    });
  },

  get: function(score) {
    var _this = this;
    Bebo.Db.get('leaderboard', {user_id: _this.user.user_id}, function(err, resp){
      if(err){ _this.throwError('get data for user', err) };
      if(resp && resp.result && resp.result[0]){
        if(!resp.result[0].score){
          _this.save(score);
        } else if(resp.result[0].score){
          if(score > resp.result[0].score){ 
            _this.save(score);
          }
        }
      } else {
        _this.save(score);
      }
    });
  },

  getTop: function(count, cb) {
    var _this = this;
    if(typeof count === 'function'){
      cb = count;
      count = 10;
    };
    Bebo.Db.get('leaderboard', {sort_by: 'score', sort_order: 'desc', count: count}, function(err, resp){
      if(err){ _this.throwError('get top ten', err) };
      cb(resp.result);
    });
  },

  topten: function(score) {
    var _this = this;
    if(_this.check(score)){ _this.notifyFriends(score) };
  },

  notifyFriends: function(score) {
    var _this = this;
    var title = Bebo.getWidgetId();
    var options = _this.options(title, 'just scored ' + score + ' in ' + title + ' can you beat that?');
    var string = 'just scored ' + score + ' in ' + title + ' can you beat that?';
    Bebo.Notification.roster('{{{user.username}}}', string, function(err, resp){
      if(err){ return console.log('error sending notifcation to roster') };
      console.log('sent notifcation to roster');
    });
  },

  options: function(content_tx) {
    var options = {};
    options.utm = {};
    options.utm.campaign_tx = 'leaderboard';
    options.utm.content_tx = content_tx;
    return options;
  },

  getTitle: function(cb) {
    cb(Bebo.getWidgetId());
  },

  throwError: function(text, err) {
    console.log('Error trying to ' + text + ':', err);
    return;
  }

};

window.Leaderboard = Leaderboard;
