var gameIndex = [
    [3, 2, 3], [4, 2, 4], [5, 2, 5], [6, 3, 4], [8, 4, 4]
];

var gameIndexPtr = 0;

var Game = function (max, slots, rows, cols) {
    this.max = max;
    this.slots = slots;
    this.rows = rows;
    this.cols = cols;
    this._deck = [];
    this._board = [];
    this._imgs = {};
    this._flipped = [];
    this._score = 0;
    this._timer = null;
    this._clock = 1000 * 60;
    this._clock_element = null;
    this._score_element = null;
};

Game.prototype.reset = function(next_level)
{
    if (next_level) {
        this.slots = gameIndex[++gameIndexPtr][0];
        this.rows = gameIndex[gameIndexPtr][1];
        this.cols = gameIndex[gameIndexPtr][2];
    } else {
        this.slots = gameIndex[gameIndexPtr][0];
        this.rows = gameIndex[gameIndexPtr][1];
        this.cols = gameIndex[gameIndexPtr][2];
    }
    this._deck = [];
    this._board = [];
    this._imgs = {};
    this._flipped = [];
    this._score = 0;
    this._timer = null;
    this._clock = 1000 * 60;
    this._clock_element = null;
    this._score_element = null;
}

Game.prototype.deck = function (clear) {
    if (clear === true || this._deck.length === 0) {
        var range = numberRange(1, this.max);

        shuffleArray(range);

        var slot = this.slots;
        var dec = [];
        while (slot > 0) {
            dec.push(range[slot--]);
        }
        this._deck = dec;
        this.images_init();
    }

    return this._deck;
};

Game.prototype.board = function (dec) {
    if (this._board.length === 0) {
        let board = [];
        dec.forEach(function (v) {
            board.push(v);
        });
        shuffleArray(dec);
        shuffleArray(dec);
        dec.forEach(function (v) {
            board.push(v);
        });
        this._board = board;
    }
    return this._board;
};

Game.prototype.get_image_path = function (index) {
    return "/images/memory/soccer/soccer_" + index + ".png";
};

Game.prototype.images_init = function() {
      let imgs = this._deck.map(function (value, index, array) {
          let img = document.createElement("img");
          img.src = Game.prototype.get_image_path(value);
          img.dataset = {id: value};
          return {key: value, asset: img};
      });
      var keys = imgs.map(function (v) {
         return v.key;
      });
      var vals = imgs.map(function (v) {
          return v.asset;
      });
      for (let i =0; i < keys.length; i++) {
          this._imgs[keys[i]] = vals[i];
    }
};

Game.prototype.get = function (index) {
    return this._imgs[this._board[index]].cloneNode();
};


Game.prototype.draw = function (element) {
    element.appendChild(this.get(i).cloneNode());
};

Game.prototype.flip = function (index, elm) {
    this._flipped.push({index: index, obj: elm.target});
    if (this._flipped.length === 2) {
        let win = false;
        if (this._board[this._flipped[0].index] === this._board[this._flipped[1].index]) {
            win = !win;
            this._score += 200;
            this.slots--;
        }
        while (this._flipped.length !== 0) {
            let item = this._flipped.pop();
            if (win) {
                $(item.obj).fadeOut(700);
            } else {
                $(item.obj).flip(false);
            }
        }
        if (this.slots === 0) {
            this._score += (100 * this._clock / 1000);
            $(this).trigger("winning", this._score);
        }
    }
};

Game.prototype.div = function(id, className)
{
    let container = document.createElement("div");
    container.className = className;
    container.id = id;
    return container;
};

Game.prototype.front = function(id)
{
    return this.div(id, 'slot_div_blue slot_div front')
};

Game.prototype.back = function(id)
{
    return this.div('_back_' + id, 'slot_div_blue slot_div back')
};

Game.prototype.slot = function (id, x, y) {
    let cont = this.div('game_' + x + '_' + y, 'slot_div_1y');
    cont.appendChild(this.front(id));
    let back = this.back(id);
    back.appendChild(this.get(id));
    cont.appendChild(back);
    return cont;
};

Game.prototype.draw_game = function(root)
{
    let index = 0;
    for (let x = 0; x < this.rows; x++) {
        let container = this.div("row_" + x, "container");
        for (let y = 0; y < this.cols; y++) {
            let slot = this.slot(index, x, y);
            $(slot).flip({autoSize: true, speed: 900});
            $(slot).on('flip:done', this.flip.bind(this, index));
            container.appendChild(slot);
            index++;
        }
        root.appendChild(container);
    }
    return root;
};

Game.prototype.clock = function () {
    this._clock -= 250;
    this._clock_element.innerHTML = parseInt(this._clock / 1000);
    this._score_element.innerHTML = this._score;
    if (this._clock <= 250) {
        $(this).trigger('timeout', this._score);
    }
};

Game.prototype.clear_timer = function() {
    window.clearInterval(this._timer);
};

Game.prototype.start = function (elm, scoreElm) {
    this._clock_element = elm;
    this._score_element = scoreElm;
    this._timer = window.setInterval(this.clock.bind(this), 250);
    $(this).on('timeout', this.clear_timer.bind(this));
    $(this).on('winning', this.clear_timer.bind(this));
};

function numberRange (start, end) {
    return new Array(end - start).fill().map((d, i) => i + start);
}

function shuffleArray (array){
    for (let i = array.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]];
    }
}

