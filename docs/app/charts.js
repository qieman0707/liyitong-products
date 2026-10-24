/* 站内小图表库：纯 SVG 字符串，零依赖，离线可开。颜色一律走 CSS 变量，跟各产品的主色走。
   用法：Viz.hbars([{l:'微博', v:5}], {label:'平台分布'}) → '<svg …>'
   所有函数只吃数字和文字，不碰 DOM；产品模块和壳都能用。 */
const Viz = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Number(n).toLocaleString('zh-CN');
  const cut = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const T = (x, y, t, cls = '', extra = '') => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(t)}</text>`;
  const svg = (w, h, inner, label, cls = '') => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(label)}" style="aspect-ratio:${w}/${h}">${inner}</svg>`;
  const A = 'var(--accent)';

  /* 横条：rows [{l 标签, v 数值, c 颜色, n 右侧附注, rt 右侧文字覆盖, t 悬停}] */
  function hbars(rows, o = {}) {
    const w = o.w || 520, rh = o.rh || 26, lw = o.lw || 120, vw = o.vw || 64, max = o.max || Math.max(1, ...rows.map(r => r.v));
    const bw = w - lw - vw - 8, h = rows.length * rh + 2, f = o.fmt || fmt;
    const inner = rows.map((r, i) => {
      const y = i * rh + 1, bh = Math.max(6, rh - 12), bl = Math.max(2, r.v / max * bw);
      const right = r.rt != null ? r.rt : f(r.v) + (r.n ? ' ' + r.n : '');
      return `<g>${T(0, y + bh / 2 + 4, cut(r.l, o.maxL || 9), r.k ? 'k' : '')}<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="var(--surface3)"/><rect x="${lw}" y="${y}" width="${bl.toFixed(1)}" height="${bh}" rx="3" fill="${r.c || A}"><title>${esc(r.t || `${r.l} ${right}`)}</title></rect>${T(lw + bw + 8, y + bh / 2 + 4, right, 'v')}</g>`;
    }).join('');
    return svg(w, h, inner, o.label || '横条图');
  }

  /* 竖条：vals 数组；o {labels, c, hi 高亮下标, every 标签间隔, vals 顶上标数, fmt} */
  function cols(vals, o = {}) {
    const w = o.w || 520, h = o.h || 150, pt = o.vals ? 18 : 8, pb = o.labels ? 20 : 6, max = Math.max(1, ...vals) * 1.05;
    const n = vals.length, cw = w / n, bw = Math.min(cw * .62, 42), f = o.fmt || fmt;
    const Y = v => pt + (h - pt - pb) * (1 - v / max);
    const base = `<line x1="0" x2="${w}" y1="${h - pb}" y2="${h - pb}" stroke="var(--line2)"/>`;
    const bars = vals.map((v, i) => { const x = i * cw + (cw - bw) / 2, y = Y(v), hi = o.hi === i; return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(h - pb - y).toFixed(1)}" rx="3" fill="${hi ? (o.hc || 'var(--ink)') : (o.c || A)}" opacity="${hi || o.c ? 1 : .85}"><title>${esc((o.labels ? o.labels[i] + '：' : '') + f(v))}</title></rect>${o.vals ? T(x + bw / 2, y - 5, f(v), 'v', 'text-anchor="middle"') : ''}`; }).join('');
    const lab = o.labels ? o.labels.map((l, i) => (o.every && i % o.every && i !== n - 1) ? '' : T(i * cw + cw / 2, h - 5, l, 'd', 'text-anchor="middle"')).join('') : '';
    if (o.inline) return `<svg class="viz spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.label || '柱状图')}">${base + bars + lab}</svg>`;
    return svg(w, h, base + bars + lab, o.label || '柱状图');
  }

  /* 漏斗：steps [{l, v}]，条宽按首项比例居中收窄 */
  function funnel(steps, o = {}) {
    const w = o.w || 520, rh = o.rh || 32, lw = o.lw || 96, vw = o.vw || 110, bw = w - lw - vw, first = Math.max(1, steps[0].v), f = o.fmt || fmt;
    const inner = steps.map((s, i) => {
      const y = i * rh, bh = rh - 10, wid = Math.max(6, s.v / first * bw), x = lw + (bw - wid) / 2;
      const pct = i ? Math.round(s.v / first * 1000) / 10 : 100;
      const drop = i && steps[i - 1].v ? Math.round(s.v / steps[i - 1].v * 100) : null;
      return `<g>${T(0, y + bh / 2 + 4, s.l, 'k')}<rect x="${x.toFixed(1)}" y="${y}" width="${wid.toFixed(1)}" height="${bh}" rx="4" fill="${s.c || o.c || A}" opacity="${(1 - i * .12).toFixed(2)}"><title>${esc(`${s.l}：${f(s.v)}，占首项 ${pct}%`)}</title></rect>${T(lw + bw + 10, y + bh / 2 + 4, f(s.v), 'v')}${T(lw + bw + 10 + (o.vw2 || 48), y + bh / 2 + 4, i ? (o.showDrop && drop != null ? `上一步的 ${drop}%` : `${pct}%`) : '', 'd')}</g>`;
    }).join('');
    return svg(w, steps.length * rh - 8, inner, o.label || '漏斗图');
  }

  /* 一根分段条：parts [{l, v, c}]；带图例 */
  function stack(parts, o = {}) {
    const w = o.w || 520, bh = o.h || 12, tot = Math.max(1, parts.reduce((a, p) => a + p.v, 0)), lg = o.legend !== false;
    let x = 0; const segs = parts.filter(p => p.v > 0).map(p => { const ww = p.v / tot * w; const s = `<rect x="${x.toFixed(1)}" y="0" width="${Math.max(1, ww - 1.5).toFixed(1)}" height="${bh}" rx="2" fill="${p.c || A}"><title>${esc(`${p.l} ${fmt(p.v)}（${Math.round(p.v / tot * 100)}%）`)}</title></rect>`; x += ww; return s; }).join('');
    let lx = 0; const legend = lg ? parts.map(p => { const txt = `${p.l} ${o.pct ? Math.round(p.v / tot * 100) + '%' : fmt(p.v)}`; const s = `<rect x="${lx}" y="${bh + 12}" width="9" height="9" rx="2" fill="${p.c || A}"/>${T(lx + 13, bh + 21, txt, 'd')}`; lx += txt.length * 7.2 + 30; return s; }).join('') : '';
    return svg(w, bh + (lg ? 28 : 0), segs + legend, o.label || '分段条');
  }

  /* 环：parts [{l, v, c}]；中间两行字 */
  function donut(parts, o = {}) {
    const s = o.size || 120, r = s / 2 - 10, cx = s / 2, cy = s / 2, C = 2 * Math.PI * r, tot = Math.max(1, parts.reduce((a, p) => a + p.v, 0));
    let off = 0; const arcs = parts.map(p => { const len = p.v / tot * C; const a = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.c || A}" stroke-width="${o.sw || 14}" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"><title>${esc(`${p.l} ${fmt(p.v)}（${Math.round(p.v / tot * 100)}%）`)}</title></circle>`; off += len; return a; }).join('');
    const c = o.center || [];
    return `<svg class="viz donut" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="${esc(o.label || '环图')}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface3)" stroke-width="${o.sw || 14}"/>${arcs}${c[0] != null ? T(cx, cy + (c[1] ? 0 : 6), c[0], 'big', 'text-anchor="middle"') : ''}${c[1] ? T(cx, cy + 16, c[1], 'd', 'text-anchor="middle"') : ''}</svg>`;
  }
  const legend = (parts, o = {}) => `<div class="viz-legend">${parts.map(p => `<span><i style="background:${p.c || A}"></i>${esc(p.l)}${p.v != null ? ` <b>${o.pct ? p.v + '%' : fmt(p.v)}</b>` : ''}</span>`).join('')}</div>`;

  /* 点带：items [{t 时间毫秒, row 行号, c, title}]，按日期落点；o {from, to, rows:[行名], w, rh} */
  function strip(items, o = {}) {
    const w = o.w || 640, rh = o.rh || 30, lw = o.lw || 36, from = o.from, to = o.to, rows = o.rows || [''], pw = w - lw - 14, D = 864e5;
    const X = t => lw + (t - from) / (to - from) * pw;
    const h = rows.length * rh + 22;
    const lanes = rows.map((r, i) => `<line x1="${lw}" x2="${w}" y1="${i * rh + rh / 2}" y2="${i * rh + rh / 2}" stroke="var(--line)"/>${T(0, i * rh + rh / 2 + 4, r, 'k')}`).join('');
    const days = Math.round((to - from) / D); const ticks = [];
    for (let d = 0; d <= days; d += (o.every || 5)) { const t = from + d * D, dt = new Date(t); ticks.push(`<line x1="${X(t).toFixed(1)}" x2="${X(t).toFixed(1)}" y1="0" y2="${rows.length * rh}" stroke="var(--line)" stroke-dasharray="2 4"/>${T(X(t), h - 6, d === days ? '今天' : `${dt.getMonth() + 1}/${dt.getDate()}`, 'd', 'text-anchor="middle"')}`); }
    const cell = {}; const dots = items.map(it => { const day = Math.floor((it.t - from) / D), key = it.row + ':' + day; const k = cell[key] = (cell[key] || 0) + 1; return { it, k, key }; });
    const dotsSvg = dots.map(({ it, k, key }) => { const n = cell[key]; const y = it.row * rh + rh / 2 + (k - (n + 1) / 2) * 7; return `<circle cx="${X(it.t).toFixed(1)}" cy="${y.toFixed(1)}" r="${it.r || 4.2}" fill="${it.c || A}" stroke="var(--surface)" stroke-width="1"><title>${esc(it.title || '')}</title></circle>`; }).join('');
    return svg(w, h, lanes + ticks.join('') + dotsSvg, o.label || '时间点带');
  }

  /* 横向时间线：events [{t 毫秒, l 标签, sub 小字, c}]，上下交错标注 */
  function timeline(events, o = {}) {
    const w = o.w || 900, h = o.h || 150, px = o.px || 70, mid = h / 2, ts = events.map(e => e.t), from = o.from || Math.min(...ts), to = o.to || Math.max(...ts);
    const X = t => px + (t - from) / Math.max(1, to - from) * (w - px * 2);
    const months = []; const d0 = new Date(from); d0.setDate(1); for (let d = new Date(d0); d <= new Date(to + 864e5 * 31); d.setMonth(d.getMonth() + 1)) { const t = d.getTime(); if (t < from - 864e5 * 31) continue; months.push(`<line x1="${X(t).toFixed(1)}" x2="${X(t).toFixed(1)}" y1="${mid - 4}" y2="${mid + 4}" stroke="var(--line2)"/>${d.getMonth() === 0 || months.length === 0 ? T(X(t), mid + 18, `${d.getFullYear()}.${d.getMonth() + 1}`, 'd', 'text-anchor="middle"') : (d.getMonth() % 3 === 0 ? T(X(t), mid + 18, `${d.getMonth() + 1} 月`, 'd', 'text-anchor="middle"') : '')}`); }
    const axis = `<line x1="${px - 20}" x2="${w - px + 20}" y1="${mid}" y2="${mid}" stroke="var(--line2)"/>`;
    const ev = events.map((e, i) => { const x = X(e.t), up = i % 2 === 0, ty = up ? mid - 34 : mid + 42; return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${up ? mid - 14 : mid}" y2="${up ? mid : mid + 24}" stroke="${e.c || A}"/><circle cx="${x.toFixed(1)}" cy="${mid}" r="6" fill="${e.c || A}" stroke="var(--paper)" stroke-width="2"><title>${esc(e.l)}</title></circle>${T(x, ty, e.sub || '', 'd', 'text-anchor="middle"')}${T(x, ty + 16, cut(e.l, o.maxL || 16), 'k', 'text-anchor="middle"')}`; }).join('');
    return svg(w, h, axis + months.join('') + ev, o.label || '时间线');
  }

  /* 散点：pts [{x, y, l, c, r}]；o {xl, yl, xfmt, yfmt, w, h, labelTop 只标最高的几个} */
  function scatter(pts, o = {}) {
    const w = o.w || 520, h = o.h || 240, pl = 44, pr = 16, pt = 12, pb = 30;
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y), xmax = o.xmax || Math.max(1, ...xs) * 1.08, ymax = o.ymax || Math.max(1, ...ys) * 1.1, xmin = o.xmin || 0, ymin = 0;
    const X = x => pl + (x - xmin) / (xmax - xmin) * (w - pl - pr), Y = y => pt + (h - pt - pb) * (1 - (y - ymin) / (ymax - ymin));
    const xf = o.xfmt || fmt, yf = o.yfmt || fmt;
    const grid = [0, .5, 1].map(f => { const y = ymin + (ymax - ymin) * f, x = xmin + (xmax - xmin) * f; return `<line x1="${pl}" x2="${w - pr}" y1="${Y(y).toFixed(1)}" y2="${Y(y).toFixed(1)}" stroke="var(--line)" stroke-dasharray="2 4"/>${T(pl - 6, Y(y) + 4, yf(Math.round(y)), 'd', 'text-anchor="end"')}${f ? `<line y1="${pt}" y2="${h - pb}" x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" stroke="var(--line)" stroke-dasharray="2 4"/>` : ''}${T(X(x), h - pb + 16, xf(Math.round(x)), 'd', 'text-anchor="middle"')}`; }).join('');
    const top = o.labelTop ? new Set([...pts].sort((a, b) => b.y - a.y).slice(0, o.labelTop)) : null;
    const dots = pts.map(p => { const x = X(p.x), y = Y(p.y); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.r || 5}" fill="${p.c || A}" fill-opacity=".85" stroke="var(--surface)" stroke-width="1"><title>${esc(`${p.l}：${o.xl || 'x'} ${xf(p.x)}，${o.yl || 'y'} ${yf(p.y)}`)}</title></circle>${(!top || top.has(p)) && p.l ? (x > w * .72 ? T(x - (p.r || 5) - 3, y + 4, cut(p.l, 8), 'd', 'text-anchor="end"') : T(x + (p.r || 5) + 3, y + 4, cut(p.l, 8), 'd')) : ''}`; }).join('');
    const axes = `${T(w - pr, h - 4, o.xl || '', 'd', 'text-anchor="end"')}${T(pl + 4, pt + 10, o.yl || '', 'd')}`;
    return svg(w, h, grid + dots + axes, o.label || '散点图');
  }

  /* 棒棒糖：rows [{l, v, target, c}]，v 和 target 同单位；o {unit, max}
     实线到 v，圆点在 v；虚线是达标线 */
  function lollipop(rows, o = {}) {
    const w = o.w || 520, rh = 30, lw = o.lw || 120, vw = 70, bw = w - lw - vw, max = o.max || Math.max(1, ...rows.flatMap(r => [r.v || 0, r.target || 0])) * 1.1, u = o.unit || '';
    const X = v => lw + v / max * bw;
    const inner = rows.map((r, i) => { const y = i * rh + rh / 2, ok = r.target == null || r.v == null || r.v <= r.target, c = r.c || (ok ? 'var(--ok)' : 'var(--bad)'); return `<g>${T(0, y + 4, r.l, 'k')}<line x1="${lw}" x2="${lw + bw}" y1="${y}" y2="${y}" stroke="var(--line)"/>${r.v != null ? `<line x1="${lw}" x2="${X(r.v).toFixed(1)}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="${X(r.v).toFixed(1)}" cy="${y}" r="6" fill="${c}"><title>${esc(`${r.l}：${r.v}${u}${r.target != null ? `，达标线 ${r.target}${u}` : ''}`)}</title></circle>` : ''}${r.target != null ? `<line x1="${X(r.target).toFixed(1)}" x2="${X(r.target).toFixed(1)}" y1="${y - 10}" y2="${y + 10}" stroke="var(--ink)" stroke-dasharray="3 3"/>` : ''}${T(lw + bw + 10, y + 4, r.v == null ? '—' : `${r.v}${u}${r.target != null ? ` / ${r.target}${u}` : ''}`, 'v')}</g>`; }).join('');
    return svg(w, rows.length * rh, inner, o.label || '时效图');
  }

  /* 迷你折线 */
  function spark(vals, o = {}) {
    const w = o.w || 160, h = o.h || 40, p = 4, max = Math.max(1, ...vals), min = o.zero ? 0 : Math.min(...vals);
    const X = i => p + i * (w - p * 2) / Math.max(1, vals.length - 1), Y = v => h - p - (v - min) / Math.max(1, max - min) * (h - p * 2);
    const pts = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`);
    return `<svg class="viz spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.label || '走势')}"><path d="M${pts[0]} L${pts.join(' L')} L${X(vals.length - 1).toFixed(1)},${h - p} L${X(0)},${h - p} Z" fill="${o.c || A}" fill-opacity=".12"/><polyline points="${pts.join(' ')}" fill="none" stroke="${o.c || A}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="${X(vals.length - 1).toFixed(1)}" cy="${Y(vals[vals.length - 1]).toFixed(1)}" r="3" fill="${o.c || A}"/></svg>`;
  }

  /* 小环（百分比） */
  function ring(pct, o = {}) {
    const s = o.size || 44, r = s / 2 - 5, C = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct));
    return `<svg class="viz ring" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="${esc(o.label || pct + '%')}"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="var(--surface3)" stroke-width="5"/><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="${o.c || A}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(C * v / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${s / 2} ${s / 2})"/>${o.text !== false ? T(s / 2, s / 2 + 4, o.text || `${Math.round(v)}%`, 'v', 'text-anchor="middle"') : ''}</svg>`;
  }

  /* 一周点阵：rows [{l, days:[7 个 0/1/2], note, c}]，列 = 周一到周日；2 = 重点 */
  function weekgrid(rows, o = {}) {
    const w = o.w || 520, rh = 30, lw = o.lw || 120, nw = o.nw || 110, cw = (w - lw - nw) / 7, DN = ['一', '二', '三', '四', '五', '六', '日'];
    const head = DN.map((d, i) => T(lw + i * cw + cw / 2, 12, `周${d}`, 'd', 'text-anchor="middle"')).join('');
    const body = rows.map((r, i) => { const y = 22 + i * rh + rh / 2; return `${T(0, y + 4, r.l, 'k')}${r.days.map((v, k) => `<circle cx="${(lw + k * cw + cw / 2).toFixed(1)}" cy="${y}" r="${v === 2 ? 8 : 6}" fill="${v ? (r.c || A) : 'var(--surface3)'}" opacity="${v === 1 ? .55 : 1}"><title>${esc(`${r.l} 周${DN[k]}${v ? '：' + (r.note || '') : '：不用管'}`)}</title></circle>`).join('')}${T(lw + 7 * cw + 10, y + 4, r.note || '', 'd')}`; }).join('');
    return svg(w, 22 + rows.length * rh, head + body, o.label || '一周点阵');
  }

  return { hbars, cols, funnel, stack, donut, legend, strip, timeline, scatter, lollipop, spark, ring, weekgrid, esc, fmt };
})();
