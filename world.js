var World = (function() {
  var world = {
    size: {x: 0, y: 0},
    grid: [],
    player: {
      x: 0,
      y: 0,
      name: "",
      style: {
        character: "",
        color: ""
      }
    },
    ids: {}
  };
  var hasChanged = false;
  var typeStyles = $("#type-styles");
  var grid = $("#grid");
  var playerElem = null;
  var templates = {
    css: _.template(
      ".type-<%= id.name %> { background: <%= id.background %>; " +
      "color: <%= id.color %>; }\n" +

      ".type-<%= id.name %>:after { content: \"<%= id.character %>\" }\n"
    ),
    player: _.template(
      "#player { color: <%= player.style.color %>; }\n" +
      "#player:after { content: \"<%= player.style.character %>\"; }\n"
    )
  };

  function getTile(x, y) {
    // erm so this SHOULD be in 3d but for now im hard-coding z as 0
    if(
      x < 0 || y < 0 ||
      x >= world.size.x || y >= world.size.y ||
      world.grid[0][y] === undefined ||
      world.grid[0][y][x] === undefined
    ) {
      return "default";
    } else {
      return world.grid[0][y][x];
    }
  }

  function type(tile) {
    if(_.has(world.ids, tile)) {
      return world.ids[tile];
    } else {
      return world.ids["default"];
    }
  }

  function movePlayer(deltaX, deltaY) {
    var newX = world.player.x + deltaX;
    var newY = world.player.y + deltaY;
    if(
      // make sure the tile we're moving to is walkable
      type(getTile(newX, newY)).walkable === true
    ) {
      world.player.x += deltaX;
      world.player.y += deltaY;
      hasChanged = true;
    }
  }

  function getPlayer() {
    return {x: world.player.x, y: world.player.y};
  }

  function getPlayerElem() {
    return playerElem;
  }


  // get new world data
  function parseWorld(data) {
    // easy stuff first
    if(
      // check world size
      _.isObject(data.size) &&
      _.isNumber(data.size.x) && data.size.x > 0 &&
      _.isNumber(data.size.y) && data.size.y > 0 &&
      // check player
      _.isObject(data.player) &&
      _.isNumber(data.player.x) &&
      _.isNumber(data.player.y) &&
      _.isString(data.player.name) &&
      _.isObject(data.player.style) &&
      _.isString(data.player.style.character) &&
      _.isString(data.player.style.color)
    ) {
      world.size = data.size;
      world.player = data.player;

      _.map(data.ids, function(idData, idName) {
        if(
          _.isString(idData.name) &&
          _.isString(idData.background) &&
          _.isString(idData.color) &&
          _.isString(idData.character) &&
          _.isBoolean(idData.walkable)
        ) {
          world.ids[idName] = idData;
        } else {
          console.log(idData);
          throw new Error("motherFUCKER");
        }
      });

      world.grid = [];

      _.map(data.grid, function(level, z) {

        if(_.isArray(level)) {
          world.grid[z] = _.map(level, function(row) {

            if(_.isString(row)) {
              return _.flatten(row);
            } else if(_.isArray(row)) {
              // ah fuck it this is complicated and i dont need it yet
              throw new Error("im a lazy shit");
            } else {
              throw new Error("Bad world grid data.");
            }

          });
        } else {
          throw new Error("Bad world grid data.");
        }

      });

      console.log(world);
    } else {
      throw new Error("Bad world size/player data.");
    }

    hasChanged = true;
  }

  // render the world into $("#grid")
  function renderGrid() {
    if(hasChanged === false) {
      return false;
    }

    // we wont be using any zepto.js $()s in here because they are
    // incredibly slow when doing this much DOM manipulation
    var newGrid = document.createElement("pre");
    newGrid.id = "grid";

    for(var y = 0; y < 17; y++) {
      for(var x = 0; x < 31; x++) {
        var gridX = x + world.player.x - 15;
        var gridY = y + world.player.y - 8;

        var curTile = getTile(gridX, gridY);
        var curType = type(curTile);
        console.log("um, so, current tile and type: ", curTile, curType);

        var newElem = document.createElement("span");
        newElem.classList.add("type-" + curType.name);
        if(x == 15 && y == 8) {
          newElem.id = "player";
        }
        newGrid.appendChild(newElem);
      }

      newGrid.appendChild(document.createElement("br"));
    }

    document.getElementById("inner-grid-div").replaceChild(
        newGrid,
        document.getElementById("grid"));
    grid = document.getElementById("grid");
    playerElem = $("#player");
    hasChanged = false;

    return true;
  }

  // update the styles of types in $("#type-styles")
  function updateStyles() {
    var newCSS = "";

    newCSS += templates.player({ player: world.player });

    _.map(world.ids, function(id) {
      newCSS += templates.css({ id: id });
    });

    typeStyles.text(newCSS);
  }

  return {
    updateStyles: updateStyles,
    renderGrid: renderGrid,
    parseWorld: parseWorld,
    movePlayer: movePlayer,
    getPlayer: getPlayer,
    getPlayerElem: getPlayerElem
  };
}());
