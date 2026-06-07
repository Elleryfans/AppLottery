/**
 * AppLottery — 彩蛋抽奖系统
 */
var THREE = require('three');
var lotteryState = { IDLE: 'idle', SPINNING: 'spinning', CRACKING: 'cracking', RESULT: 'result' };
var currentState = lotteryState.IDLE;

var sceneObjects = null;
var eggs = [];
var winnerEgg = null;
var spinningSpeed = 0;
var spinningTimer = 0;
var renderLoopId = null;

// --- Init ---

function initScene() {
  var container = document.getElementById('scene-area');
  if (!container) return;

  var ts = require('./three-scene.js');
  sceneObjects = ts.initScene(container);

  // Create eggs
  var eggModule = require('./eggs.js');
  eggs = eggModule.createEggs(sceneObjects.scene, 8);

  // Create particles
  var particles = require('./particles.js');
  var ps = particles.createParticles(150);
  sceneObjects.scene.add(ps.points);

  // Render loop
  var lastTime = performance.now();
  function loop() {
    renderLoopId = requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Update egg ring (idle: slow, spinning: fast)
    var idleSpeed = 0.3;
    eggModule.updateEggRing(eggs, dt, Math.max(idleSpeed, spinningSpeed));

    // Spinning: decelerate, auto-stop after 3-4s
    if (currentState === lotteryState.SPINNING) {
      spinningTimer += dt;
      if (spinningTimer > 3.5) {
        // Slow down to stop
        spinningSpeed *= 0.95;
        if (spinningSpeed < 1.5) {
          stopLottery();
        }
      }
    }

    // Winner egg: move to center then crack
    if (currentState === lotteryState.CRACKING && winnerEgg) {
      if (winnerEgg.userData.moving) {
        // Animate to center
        winnerEgg.userData.movePhase += dt * 2;
        var t = Math.min(1, winnerEgg.userData.movePhase);
        var eased = 1 - Math.pow(1 - t, 3); // ease-out
        winnerEgg.position.lerpVectors(winnerEgg.userData.moveOrigin, new THREE.Vector3(0, 0, 0), eased);
        // Grow slightly
        var gs = 1 + eased * 0.3;
        winnerEgg.scale.setScalar(gs);
        if (t >= 1) {
          winnerEgg.userData.moving = false;
          winnerEgg.userData.crackOrigin = winnerEgg.position.clone();
        }
      } else {
        // Crack
        eggModule.animateEggCrack(winnerEgg, function() {
          showIconReveal();
        }, dt);
      }
    }

    // Result countdown
    if (currentState === lotteryState.RESULT) {
      resultTimer -= dt;
      if (resultTimer <= 0) {
        launchWinner();
      }
    }

    ps.update(dt);
    sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
  }
  loop();
}

// --- Icon reveal ---

function showIconReveal() {
  if (!winnerEgg) return;
  setState(lotteryState.RESULT);
  resultTimer = 2;

  var app = winnerEgg.userData.app;
  if (!app) return;
  winnerAppData = app;

  // Show fullscreen HTML overlay
  var overlay = document.getElementById('winner-overlay');
  var icon = document.getElementById('winner-icon');
  var name = document.getElementById('winner-name');
  if (overlay && icon && name) {
    icon.src = app.icon;
    name.textContent = app.name;
    overlay.classList.add('active');
  }
}

function hideWinnerOverlay() {
  var overlay = document.getElementById('winner-overlay');
  if (overlay) overlay.classList.remove('active');
}

var resultTimer = 0;
var winnerAppData = null;

function launchWinner() {
  if (winnerAppData) {
    window.electronAPI.launchApp(winnerAppData.path);
  }
  resetLottery();
}

function resetLottery() {
  currentState = lotteryState.IDLE;
  spinningSpeed = 0;
  winnerEgg = null;
  winnerAppData = null;
  resultTimer = 0;
  spinningTimer = 0;

  hideWinnerOverlay();

  // Restore all eggs
  eggs.forEach(function(e) { e.visible = true; e.material.opacity = 0.7; e.material.color.setHex(0x00ffff); e.userData.crackPhase = 0; e.scale.set(1, 1, 1); e.userData.innerSphere.material.opacity = 0.1; });
  setState(lotteryState.IDLE);
}

// --- Start lottery ---

function startLottery() {
  if (eggs.length === 0) { showError('没有彩蛋'); return; }
  setState(lotteryState.SPINNING);
  spinningSpeed = 3;
  spinningTimer = 0;
}

function stopLottery() {
  var apps = [];
  eggs.forEach(function(e) {
    if (e.userData.app) apps.push(e.userData.app);
  });
  if (apps.length === 0) { resetLottery(); return; }

  var winner = apps[Math.floor(Math.random() * apps.length)];
  winnerAppData = winner;
  winnerEgg = eggs.find(function(e) { return e.userData.app && e.userData.app.id === winner.id; });

  if (!winnerEgg) { resetLottery(); return; }

  // Save origin for centering animation
  winnerEgg.userData.moveOrigin = winnerEgg.position.clone();
  winnerEgg.userData.movePhase = 0;
  winnerEgg.userData.moving = true;

  setState(lotteryState.CRACKING);
  spinningSpeed = 1;
}

// --- Icon texture ---

function createIconTexture(iconData) {
  var nativeImage = require('electron').nativeImage;
  var canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.fill();

  if (iconData && iconData.length > 200) {
    try {
      var ni = nativeImage.createFromDataURL(iconData);
      if (!ni.isEmpty()) {
        var size = ni.getSize();
        var ri = size.width > 128 ? ni.resize({ width: 128, height: Math.round(size.height * 128 / size.width) }) : ni;
        var rgba = ri.toBitmap();
        var w = ri.getSize().width, h = ri.getSize().height;
        var tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
        var tmpCtx = tmp.getContext('2d');
        var imgData = tmpCtx.createImageData(w, h);
        for (var i = 0; i < rgba.length; i += 4) {
          imgData.data[i] = rgba[i + 2];
          imgData.data[i + 1] = rgba[i + 1];
          imgData.data[i + 2] = rgba[i];
          imgData.data[i + 3] = rgba[i + 3];
        }
        tmpCtx.putImageData(imgData, 0, 0);
        ctx.save(); ctx.beginPath(); ctx.arc(128, 128, 108, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(tmp, 20, 20, 216, 216); ctx.restore();
      }
    } catch(e) {}
  } else {
    ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(128, 128, 118, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

// --- DOM helpers ---
function $(id) { return document.getElementById(id); }

function showModal() { var o = $('modal-overlay'); if (o) o.classList.add('active'); refreshModalList(); }
function hideModal() { var o = $('modal-overlay'); if (o) o.classList.remove('active'); }

function refreshModalList() {
  var list = $('modal-app-list'); if (!list) return;
  window.electronAPI.getApps().then(function(apps) {
    renderAppItems(list, apps, true);
    var ce = $('modal-count'); if (ce) ce.textContent = String(apps.length);
    // Assign apps to eggs
    apps.forEach(function(app, i) {
      if (eggs[i]) eggs[i].userData.app = app;
    });
  });
}

function loadAppList() {
  window.electronAPI.getApps().then(function(apps) {
    updateAppCount(apps.length);
    updateGuideText(apps.length);
    updateButtonStates(apps.length);
    apps.forEach(function(app, i) { if (eggs[i]) eggs[i].userData.app = app; });
  });
}

function loadMainAppList() {
  window.electronAPI.getApps().then(function(apps) {
    updateAppCount(apps.length);
    updateGuideText(apps.length);
    apps.forEach(function(app, i) { if (eggs[i]) eggs[i].userData.app = app; });
  });
}

function renderAppItems(container, apps, showActions) {
  if (!container) return;
  container.innerHTML = '';
  apps.forEach(function(app) {
    var item = document.createElement('div'); item.className = 'app-item';
    var icon = document.createElement('img'); icon.src = app.icon; icon.className = 'app-icon';
    var name = document.createElement('span'); name.textContent = app.name; name.className = 'app-name';
    item.appendChild(icon); item.appendChild(name);
    if (showActions) {
      var iconBtn = document.createElement('button'); iconBtn.textContent = '图'; iconBtn.className = 'edit-btn';
      iconBtn.addEventListener('click', function(e) { e.stopPropagation(); pickCustomIcon(app); });
      var delBtn = document.createElement('button'); delBtn.textContent = '删'; delBtn.className = 'delete-btn';
      delBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.electronAPI.deleteApp(app.id).then(function() { refreshModalList(); loadMainAppList(); });
      });
      item.appendChild(iconBtn); item.appendChild(delBtn);
    }
    name.addEventListener('click', function(e) { e.stopPropagation(); startEditName(app, name); });
    icon.addEventListener('click', function(e) { e.stopPropagation(); pickCustomIcon(app); });
    container.appendChild(item);
  });
}

function startEditName(app, nameEl) {
  var input = document.createElement('input'); input.type = 'text'; input.value = app.name;
  input.style.cssText = 'flex:1;background:#111;border:1px solid #0ff;color:#0ff;padding:4px 8px;font:inherit;';
  nameEl.parentNode.replaceChild(input, nameEl); input.focus(); input.select();
  function finish() {
    var n = input.value.trim();
    if (n && n !== app.name) {
      window.electronAPI.updateApp(app.id, { name: n }).then(function() { refreshModalList(); loadMainAppList(); });
    } else { input.parentNode.replaceChild(nameEl, input); }
  }
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = app.name; input.blur(); } });
}

function pickCustomIcon(app) {
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/ico'; input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', function() {
    var file = input.files[0]; document.body.removeChild(input); if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      window.electronAPI.updateApp(app.id, { icon: reader.result }).then(function() { refreshModalList(); loadMainAppList(); });
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

function updateAppCount(c) { var e = $('app-count'); if (e) e.textContent = String(c); }
function updateGuideText(c) { var e = $('guide-text'); if (e) e.style.display = c === 0 ? 'block' : 'none'; }

function updateButtonStates(count) {
  var s = $('btn-start'), c = $('btn-cancel'), m = $('btn-manage');
  if (!s || !c) return;
  if (currentState === lotteryState.IDLE) {
    s.style.display = 'inline-block'; s.textContent = '开始抽奖';
    c.style.display = 'none'; if (m) m.disabled = false;
    s.disabled = (count === 0);
  } else {
    s.style.display = 'none'; c.style.display = 'inline-block'; if (m) m.disabled = true;
  }
}

function setState(s) { currentState = s; updateButtonStates(eggs.filter(function(e) { return e.userData.app; }).length); }

function showError(msg) {
  var t = $('error-toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}

// --- Events ---

function bindEvents() {
  var be = $('btn-exit'), bm = $('btn-manage'), bs = $('btn-start'), bc = $('btn-cancel'), ba = $('btn-add-app');
  var mo = $('modal-overlay'), mc = $('modal-close'), mca = $('btn-modal-cancel');

  if (be) be.addEventListener('click', function() { window.electronAPI.exitApp(); });
  if (bm) bm.addEventListener('click', function() { showModal(); });
  if (mc) mc.addEventListener('click', function() { hideModal(); });
  if (mca) mca.addEventListener('click', function() { hideModal(); });
  if (mo) mo.addEventListener('click', function(e) { if (e.target === e.currentTarget) hideModal(); });

  if (bs) bs.addEventListener('click', function() {
    if (currentState === lotteryState.IDLE && eggs.filter(function(e) { return e.userData.app; }).length > 0) {
      startLottery();
    }
  });

  if (bc) bc.addEventListener('click', function() {
    if (currentState !== lotteryState.IDLE) resetLottery();
  });

  if (ba) ba.addEventListener('click', function() {
    window.electronAPI.addApp().then(function(r) {
      if (r.errors && r.errors.length > 0) showError(r.errors[0].message);
      refreshModalList(); loadMainAppList();
    });
  });

  // Search
  var si = $('search-input'), sr = $('search-results'), st = null;
  if (si) {
    si.addEventListener('input', function() {
      clearTimeout(st);
      var q = si.value.trim();
      st = setTimeout(function() {
        if (!q) { sr.innerHTML = ''; return; }
        window.electronAPI.searchSystemApps(q).then(function(apps) {
          sr.innerHTML = '';
          if (apps.length === 0) { sr.innerHTML = '<div class="search-empty">未找到</div>'; return; }
          apps.forEach(function(a) {
            var d = document.createElement('div'); d.className = 'search-result-item'; d.textContent = a.name;
            d.addEventListener('click', function() {
              window.electronAPI.importApps([a.path]).then(function(r) {
                if (r.errors && r.errors.length > 0) showError(r.errors[0].message);
                si.value = ''; sr.innerHTML = ''; refreshModalList(); loadMainAppList();
              });
            });
            sr.appendChild(d);
          });
        });
      }, 200);
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (mo && mo.classList.contains('active')) hideModal();
      else window.electronAPI.toggleFullscreen();
    }
  });

  // Drag-drop
  var sceneArea = $('scene-area');
  if (sceneArea) {
    sceneArea.addEventListener('dragover', function(e) { e.preventDefault(); sceneArea.classList.add('drag-over'); });
    sceneArea.addEventListener('dragleave', function(e) { sceneArea.classList.remove('drag-over'); });
    sceneArea.addEventListener('drop', function(e) {
      e.preventDefault(); sceneArea.classList.remove('drag-over');
      var files = e.dataTransfer.files; if (!files || !files.length) return;
      var paths = [];
      for (var i = 0; i < files.length; i++) {
        var n = files[i].name.toLowerCase();
        if (n.endsWith('.lnk') || n.endsWith('.exe') || n.endsWith('.url')) paths.push(files[i].path);
      }
      if (!paths.length) { showError('请拖入 .lnk / .exe / .url'); return; }
      window.electronAPI.importApps(paths).then(function(r) {
        if (r.errors) r.errors.forEach(function(e) { showError(e.message); });
        refreshModalList(); loadMainAppList();
      });
    });
  }
}

// --- Startup ---

document.addEventListener('DOMContentLoaded', function() {
  bindEvents();
  initScene();
  loadAppList();
});

module.exports = {
  lotteryState: lotteryState, setState: setState, loadAppList: loadAppList,
  renderAppItems: renderAppItems, updateGuideText: updateGuideText,
  updateButtonStates: updateButtonStates, showModal: showModal, hideModal: hideModal, showError: showError
};
