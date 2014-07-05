var World = (function() {
  var world = {
    size: {x: 0, y: 0},
    grid: [],
    player: {},
    ids: {}
  };
  var hasChanged = false;
  var typeStyles = $("#type-styles");
  var grid = $("#grid");
  var playerElem = null;

  function getTile(x, y) {
    if(
      x < 0 || y < 0 ||
      x >= world.size.x || y >= world.size.y ||
      world.grid[y] === undefined ||
      world.grid[y][x] === undefined
    ) {
      return "default";
    } else {
      return world.grid[y][x];
    }
  }

  function type(tile) {
    if(world.ids[tile] !== undefined) {
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
    if(!data.size || !data.grid || !data.player || !data.ids) {
      throw new Error("bad data, yo");
    }
    world.size = data.size;
    world.grid = data.grid;
    world.player = data.player;
    world.ids = data.ids;
    hasChanged = true;
  }

  // render the world into $("#grid")
  function renderGrid() {
    if(hasChanged === false) {
      return;
    }

    var benchmarkStart = new Date().getTime();

    var newGrid = $("<pre id=grid>");

    for(var y = 0; y < 17; y++) {
      for(var x = 0; x < 31; x++) {
        var gridX = x + world.player.x - 16;
        var gridY = y + world.player.y - 9;

        var curTile = getTile(gridX, gridY);
        var curType = type(curTile);

        if(x == 16 && y == 9) {
          newGrid.append("<span class=\"type-" + curType.type + " player\">" +
                         world.player.style.character + "</span>");
        } else {
          newGrid.append("<span class=\"type-" + curType.type + "\">" +
                         curType.character + "</span>");
        }
      }

      newGrid.append("<br />");
    }

    $("#grid").replaceWith(newGrid);
    playerElem = $(".player");
    hasChanged = false;

    console.log(new Date().getTime() - benchmarkStart);
  }

  // update the styles of types in $("#type-styles")
  function updateStyles() {
    var newCSS = "";

    newCSS += ".player{color:" + world.player.style.color + " !important;}";

    _.map(world.ids, function(id) {
      newCSS += ".type-" + id.type + "{background:" + id.background +
                ";color:" + id.color + ";}\n";
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
