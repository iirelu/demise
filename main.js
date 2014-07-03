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
    View.setPos(-241 + player.left, -232 + player.top);
  }

  requestAnimationFrame(render);
}

var keycheck = {w: false, a: false, s: false, d: false};
Mousetrap.bind(["w", "a", "s", "d"], function(e, key) {
  if(keycheck[key] === false) {
    //keycheck[key] = true;
    if(key === "w") World.movePlayer(0, -1);
    if(key === "a") World.movePlayer(-1, 0);
    if(key === "s") World.movePlayer(0, 1);
    if(key === "d") World.movePlayer(1, 0);
  }
}, "keydown");
Mousetrap.bind(["w", "a", "s", "d"], function(e, key) {
  keycheck[key] = false;
}, "keyup");

View = (function() {
  var mover = $("#inner-grid-div");
  var x = 0;
  var y = 0;

  function update() {
    mover.css("transform", "translate(" + (-x) + "px," + (-y) + "px)");
  }

  function setPos(newX, newY) {
    x = newX;
    y = newY;
    update();
  }

  return {
    setPos: setPos
  }
}());
