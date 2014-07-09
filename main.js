$.getJSON("world.json", function(data, status) {
  console.log(status);
  if(status !== "success") {
    throw new Error("carooooool heeeeelp");
  }

  World.parseWorld(data);
  World.updateStyles();
  requestAnimationFrame(render);
});

function render() {
  World.renderGrid();

  player = World.getPlayerElem().position();
  if(player !== undefined) {
    $("#inner-grid-div").css("transform", "translate(" +
        (241 - player.left) + "px," +
        (232 - player.top) + "px)");
  }

  requestAnimationFrame(render);
}

Mousetrap.bind(["w", "a", "s", "d"], function(e, key) {
  if(key === "w") World.movePlayer(0, -1);
  if(key === "a") World.movePlayer(-1, 0);
  if(key === "s") World.movePlayer(0, 1);
  if(key === "d") World.movePlayer(1, 0);
});

