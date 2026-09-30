/* Snellman Kitchens — interactions */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader ---------- */
  var loader = document.getElementById('loader'), bar = loader ? loader.querySelector('.bar span') : null, p = 0;
  function tick(){ if(!loader||loader.classList.contains('done')) return; p = Math.min(p + Math.random()*22, 96); if(bar) bar.style.width = p + '%'; if(p < 96) setTimeout(tick, 220); }
  tick();
  window.addEventListener('load', function(){ setTimeout(function(){ if(loader){ if(bar) bar.style.width='100%'; loader.classList.add('done'); document.body.classList.remove('locked'); } }, 500); });
  document.body.classList.add('locked');
  setTimeout(function(){ if(loader && !loader.classList.contains('done')){ loader.classList.add('done'); document.body.classList.remove('locked'); } }, 4000);

  /* ---------- custom cursor ---------- */
  var cur = document.getElementById('cursor');
  if (cur && window.matchMedia('(hover:hover)').matches){
    document.addEventListener('mousemove', function(e){ cur.classList.add('on'); cur.style.left = e.clientX+'px'; cur.style.top = e.clientY+'px'; });
    document.querySelectorAll('.g-item, .svc').forEach(function(el){
      el.addEventListener('mouseenter', function(){ cur.classList.add('view'); });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('view'); });
    });
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav'), lastY = 0;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if (nav){ nav.classList.toggle('scrolled', y > 40); if (y > 500 && y > lastY + 4) nav.classList.add('hidden'); else if (y < lastY - 4) nav.classList.remove('hidden'); }
    lastY = y;
    var hb = document.getElementById('heroBg');
    if (hb && !reduce && y < window.innerHeight) hb.style.transform = 'scale(1.06) translateY(' + (y*0.22) + 'px)';
  }, {passive:true});

  var burger = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
  if (burger && mm){ burger.addEventListener('click', function(){ mm.classList.toggle('open'); document.body.classList.toggle('locked'); }); mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mm.classList.remove('open'); document.body.classList.remove('locked'); }); }); }

  /* ---------- page wipe on internal nav ---------- */
  var wipe = document.getElementById('wipe');
  if (wipe && !reduce){
    document.querySelectorAll('a[href$=".html"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var href = a.getAttribute('href');
        if (href.charAt(0) === '#' || a.target === '_blank') return;
        e.preventDefault(); wipe.classList.remove('run'); void wipe.offsetWidth; wipe.classList.add('run');
        setTimeout(function(){ window.location.href = href; }, 620);
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.12});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  /* ---------- animated counters ---------- */
  var cio = new IntersectionObserver(function(es){ es.forEach(function(e){
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    var el = e.target, end = parseFloat(el.dataset.count), t0 = null, dur = 1400;
    function step(t){ if(!t0) t0 = t; var k = Math.min((t-t0)/dur, 1), v = Math.round(end * (1-Math.pow(1-k,3))); el.firstChild.nodeValue = v; if (k<1) requestAnimationFrame(step); }
    if (reduce){ el.firstChild.nodeValue = end; } else requestAnimationFrame(step);
  }); }, {threshold:.5});
  document.querySelectorAll('.stat .num[data-count]').forEach(function(el){ cio.observe(el); });

  /* ---------- marquee duplicate ---------- */
  document.querySelectorAll('.marquee .track').forEach(function(t){ t.innerHTML += t.innerHTML; });

  /* ---------- gallery filters ---------- */
  var fbtns = document.querySelectorAll('.filters button');
  if (fbtns.length){
    fbtns.forEach(function(b){ b.addEventListener('click', function(){
      fbtns.forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on');
      var f = b.dataset.filter;
      document.querySelectorAll('.g-item').forEach(function(it){
        var show = f === 'all' || it.dataset.cat === f;
        it.style.display = show ? '' : 'none';
      });
    }); });
  }

  /* ---------- lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lb = document.getElementById('lightbox'), lbImg = lb ? lb.querySelector('img') : null, lbCap = lb ? lb.querySelector('.lb-cap') : null, visList = [], vi = 0;
  function visibleItems(){ return items.filter(function(x){ return x.style.display !== 'none'; }); }
  function showLb(){
    var it = visList[vi]; if(!it) return;
    lbImg.src = it.dataset.full || it.querySelector('img').src;
    lbImg.alt = it.dataset.cap || '';
    if (lbCap) lbCap.textContent = it.dataset.cap || '';
    lb.classList.add('open'); document.body.classList.add('locked');
  }
  function openLb(i){ visList = visibleItems(); vi = Math.max(0, visList.indexOf(items[i])); showLb(); }
  function navLb(d){ if(!visList.length) return; vi = (vi + d + visList.length) % visList.length; showLb(); }
  if (lb){
    items.forEach(function(it, i){ it.addEventListener('click', function(){ openLb(i); }); });
    lb.querySelector('.lb-x').addEventListener('click', closeLb);
    lb.querySelector('.prev').addEventListener('click', function(e){ e.stopPropagation(); navLb(-1); });
    lb.querySelector('.next').addEventListener('click', function(e){ e.stopPropagation(); navLb(1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){ if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') navLb(-1); if (e.key === 'ArrowRight') navLb(1); });
  }
  function closeLb(){ lb.classList.remove('open'); document.body.classList.remove('locked'); }

  /* ---------- testimonial slider ---------- */
  var revs = document.querySelectorAll('.rev'), dots = document.querySelectorAll('.rev-dots button'), ri = 0, rT;
  function goRev(i){ if(!revs.length) return; ri = (i + revs.length) % revs.length; revs.forEach(function(r,k){ r.classList.toggle('on', k===ri); }); dots.forEach(function(d,k){ d.classList.toggle('on', k===ri); }); }
  if (revs.length){ dots.forEach(function(d,k){ d.addEventListener('click', function(){ goRev(k); restart(); }); }); function restart(){ clearInterval(rT); if(!reduce) rT = setInterval(function(){ goRev(ri+1); }, 6500); } restart(); }

  /* ---------- faq ---------- */
  document.querySelectorAll('.faq-item').forEach(function(it){
    var q = it.querySelector('.faq-q'), a = it.querySelector('.faq-a');
    q.addEventListener('click', function(){
      var open = it.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){ o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
      if (!open){ it.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------- magnetic buttons ---------- */
  if (window.matchMedia('(hover:hover)').matches && !reduce){
    document.querySelectorAll('.btn.magnetic').forEach(function(b){
      b.addEventListener('mousemove', function(e){ var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX-r.left-r.width/2)*.18) + 'px,' + ((e.clientY-r.top-r.height/2)*.28) + 'px)'; });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  /* ---------- quote form (front-end only — wire to email/CRM at launch) ---------- */
  var form = document.getElementById('quoteForm'), msg = document.getElementById('formMsg');
  if (form){ form.addEventListener('submit', function(e){ e.preventDefault(); if (msg){ msg.style.display = 'block'; msg.textContent = 'Thank you — your request has been received. Our design team will call you back within one business day.'; } form.reset(); form.scrollIntoView({behavior:'smooth', block:'center'}); }); }

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
