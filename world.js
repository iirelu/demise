/*exported World*/

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

  function getTile(x, y, z) {
    if(
      _.isNumber(x) &&
      _.isNumber(y) &&
      _.isNumber(z)
    ) {
      if(
        x < 0 || y < 0 || z < 0 ||
        x >= world.size.x || y >= world.size.y ||
        world.grid[z] === undefined ||
        world.grid[z][y] === undefined ||
        world.grid[z][y][x] === undefined
      ) {
        return "default";
      } else {
        return world.grid[z][y][x];
      }
    } else {
      throw new Error("Bad coordinates sent to getTile()");
    }
  }

  function type(tile) {
    if(_.has(world.ids, tile)) {
      return world.ids[tile];
    } else {
      return world.ids["default"];
    }
  }

  function isSolid(x, y, z) {
    return type(getTile(x, y, z)).solid;
  }

  function movePlayer(deltaX, deltaY) {
    var oldX = world.player.x;
    var oldY = world.player.y;
    var oldZ = world.player.z;
    var newX = oldX + deltaX;
    var newY = oldY + deltaY;
    var newZ = oldZ;

    if(isSolid(oldX, oldY, oldZ - 1) === false) {
      // we're falling!
      setPlayerPosition(oldX, oldY, oldZ - 1);
    } else {
      if(isSolid(newX, newY, newZ) === false) {
        if(isSolid(newX, newY, newZ - 1) === false) {
          // stepping down
          setPlayerPosition(newX, newY, newZ - 1);
        } else {
          // can move directly there so we do
          setPlayerPosition(newX, newY, newZ);
        }
      } else {
        newZ += 1;
        if(
          // trying to climb a one-block step
          isSolid(newX, newY, newZ) === false &&
          isSolid(oldX, oldY, newZ) === false
        ) {
          setPlayerPosition(newX, newY, newZ);
        }
      }
    }
  }

  function setPlayerPosition(x, y, z) {
    if(
      _.isNumber(x) &&
      _.isNumber(y) &&
      _.isNumber(z)
    ) {
      world.player.x = x;
      world.player.y = y;
      world.player.z = z;
      hasChanged = true;
    } else {
      throw new Error("Bad coordinates sent to setPlayerPosition()");
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
      world.size.x = data.size.x;
      world.size.y = data.size.y;
      world.size.z = data.size.z;

      world.player.x = data.player.x;
      world.player.y = data.player.y;
      world.player.z = data.player.z;
      world.player.name = data.player.name;
      world.player.style.color = data.player.style.color;
      world.player.style.character = data.player.style.character;

      _.map(data.ids, function(idData, idName) {
        if(
          _.isString(idData.name) &&
          _.isString(idData.background) &&
          _.isString(idData.color) &&
          _.isString(idData.character) &&
          _.isBoolean(idData.solid)
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
          if(z >= world.grid.z) {
            return undefined;
          }

          world.grid[z] = _.map(level, function(row, y) {
            if(y < world.size.y) {
              if(_.isString(row)) {

                return _.map(row, function(column, x) {
                  if(x < world.size.x) {
                    return column;
                  }
                });

              } else if(_.isArray(row)) {
                // ah fuck it this is complicated and i dont need it yet
                throw new Error("im a lazy shit");
              } else {
                throw new Error("Bad world grid data.");
              }
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
        var gridZ = world.player.z;

        var curTile = getTile(gridX, gridY, gridZ);
        var curType = type(curTile);

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
    setPlayerPosition: setPlayerPosition,
    getPlayer: getPlayer,
    getPlayerElem: getPlayerElem,

    world: world
  };
}());
