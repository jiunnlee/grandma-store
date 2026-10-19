/* 場景：扁平等距風格的小店（取自風格試稿 A，招牌改為「阿嬤的小店」） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Scene = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function cat(mood) {
    // mood: 'sleep' | 'awake' | 'shock'
    const eyes = mood === 'sleep' ? '<path d="M478 300q4 3 8 0M494 300q4 3 8 0" fill="none" stroke="#2B2B2B" stroke-width="1.6" stroke-linecap="round"/>'
      : mood === 'shock' ? '<circle cx="482" cy="299" r="3.5" fill="#fff"/><circle cx="498" cy="299" r="3.5" fill="#fff"/><circle cx="482" cy="299" r="1.6" fill="#2B2B2B"/><circle cx="498" cy="299" r="1.6" fill="#2B2B2B"/>'
      : '<circle cx="482" cy="300" r="2" fill="#2B2B2B"/><circle cx="498" cy="300" r="2" fill="#2B2B2B"/>';
    return `<g id="cat">
      <ellipse cx="490" cy="322" rx="18" ry="5" fill="#000" fill-opacity=".15"/>
      <ellipse cx="490" cy="310" rx="18" ry="11" fill="#E8A552"/>
      <circle cx="490" cy="300" r="12" fill="#E8A552"/>
      <polygon points="480,292 476,280 486,289" fill="#E8A552"/><polygon points="500,292 504,280 494,289" fill="#E8A552"/>
      ${eyes}
      <path d="M488 305h4l-2 2z" fill="#D9533F"/>
      <path d="M470 312q-10 -8 -2 -16" fill="none" stroke="#E8A552" stroke-width="5" stroke-linecap="round"/>
    </g>`;
  }
  function grandma() {
    return `<g id="grandma" transform="translate(250 262)">
      <ellipse cx="0" cy="58" rx="16" ry="6" fill="#000" fill-opacity=".15"/>
      <rect x="-7" y="42" width="5" height="14" rx="2" fill="#5B4A6B"/><rect x="2" y="42" width="5" height="14" rx="2" fill="#5B4A6B"/>
      <path d="M-13 14h26l4 30h-34z" fill="#8E6BB0"/>
      <rect x="-19" y="18" width="6" height="16" rx="3" fill="#8E6BB0"/><rect x="13" y="18" width="6" height="16" rx="3" fill="#8E6BB0"/>
      <circle cx="-18" cy="36" r="3.5" fill="#F1C27D"/><circle cx="18" cy="36" r="3.5" fill="#F1C27D"/>
      <circle cx="0" cy="2" r="13" fill="#F1C27D"/>
      <path d="M-14 -1a14 12 0 0 1 28 0z" fill="#E6E6E6"/><circle cx="0" cy="-12" r="5" fill="#E6E6E6"/>
      <circle cx="-5" cy="5" r="1.6" fill="#2B2B2B"/><circle cx="5" cy="5" r="1.6" fill="#2B2B2B"/>
      <circle cx="-5" cy="5" r="4" fill="none" stroke="#5B4A6B" stroke-width="1"/><circle cx="5" cy="5" r="4" fill="none" stroke="#5B4A6B" stroke-width="1"/>
      <path d="M-4 10q4 3 8 0" fill="none" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/>
    </g>`;
  }
  function render(opts) {
    opts = opts || {};
    const sign = opts.sign || '阿嬤的小店';
    const catMood = opts.cat || 'sleep';
    const showGrandma = opts.grandma !== false;
    return `<svg viewBox="0 0 600 380" role="img" aria-label="扁平等距風格的小店、店長、阿嬤與店貓發財">
  <defs><linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-top, #BFE4F2)"/><stop offset="1" stop-color="var(--sky-bot, #FFF2C8)"/></linearGradient></defs>
  <rect class="sky" x="0" y="0" width="600" height="380" fill="url(#skyGrad)"/>
  <g id="stars" opacity="${opts.time === 'night' ? 1 : 0}"><circle cx="80" cy="50" r="1.5" fill="#fff"/><circle cx="140" cy="30" r="1" fill="#fff"/><circle cx="500" cy="60" r="1.5" fill="#fff"/><circle cx="540" cy="25" r="1" fill="#fff"/><circle cx="420" cy="40" r="1.2" fill="#fff"/></g>
  <circle cx="${opts.time === 'night' ? 520 : 90}" cy="60" r="22" fill="${opts.time === 'night' ? '#FFF4C2' : '#FFD166'}" opacity=".9"/>
  <polygon points="70,230 300,115 530,230 300,345" fill="#B7DDB0"/>
  <polygon points="70,230 300,345 300,365 70,250" fill="#8FBF86"/>
  <polygon points="300,345 530,230 530,250 300,365" fill="#79AD72"/>
  <polygon points="300,155 430,220 300,285 170,220" fill="#E3E8D8"/>
  <rect x="128" y="235" width="6" height="22" fill="#7A4B2A"/>
  <circle cx="131" cy="222" r="20" fill="#4FA66A"/><circle cx="118" cy="232" r="14" fill="#5DB879"/><circle cx="146" cy="232" r="15" fill="#3F9158"/>
  <polygon points="190,225 300,280 300,190 190,135" fill="#F6D77B"/>
  <polygon points="300,280 410,225 410,135 300,190" fill="#E3BC53"/>
  <polygon points="190,177 212,188 212,170 190,159" fill="#D9533F"/><polygon points="212,188 234,199 234,181 212,170" fill="#FFFFFF"/>
  <polygon points="234,199 256,210 256,192 234,181" fill="#D9533F"/><polygon points="256,210 278,221 278,203 256,192" fill="#FFFFFF"/>
  <polygon points="278,221 300,232 300,214 278,203" fill="#D9533F"/>
  <polygon points="198.8,215.4 236.2,234.1 236.2,208.1 198.8,189.4" fill="#8FD0E8" stroke="#3B6E8F" stroke-width="1.5"/>
  <polygon points="250.5,255.25 283.5,271.75 283.5,233.75 250.5,217.25" fill="#7A4B2A"/>
  <circle cx="278" cy="256" r="1.8" fill="#FFC93C"/>
  <polygon points="316.5,219.75 393.5,181.25 393.5,155.25 316.5,193.75" fill="#2B3A55"/>
  <g transform="translate(355 187) skewY(-26.5)">
    <text y="4" text-anchor="middle" font-size="13" font-weight="900" fill="#FFC93C" font-family="Noto Sans TC, sans-serif">${sign}</text>
  </g>
  <polygon points="313.2,259.4 344,244 344,218 313.2,233.4" fill="#8FD0E8" stroke="#3B6E8F" stroke-width="1.5"/>
  <polygon points="366,233 396.8,217.6 396.8,191.6 366,207" fill="#8FD0E8" stroke="#3B6E8F" stroke-width="1.5"/>
  <polygon points="175,145 300,208 300,198 175,135" fill="#B8401F"/>
  <polygon points="300,208 425,145 425,135 300,198" fill="#9C3519"/>
  <polygon points="300,72 425,135 300,198 175,135" fill="#E4572E"/>
  <polygon points="300,95 380,135 300,175 220,135" fill="#F08A5D"/>
  <polygon points="430,250 448,259 430,268 412,259" fill="#E8C07A"/><polygon points="412,259 430,268 430,286 412,277" fill="#C99A4E"/><polygon points="430,268 448,259 448,277 430,286" fill="#B3843C"/>
  <ellipse cx="335" cy="320" rx="16" ry="6" fill="#000" fill-opacity=".15"/>
  <rect x="328" y="304" width="5" height="14" rx="2" fill="#2B3A55"/><rect x="337" y="304" width="5" height="14" rx="2" fill="#2B3A55"/>
  <rect x="319" y="282" width="6" height="16" rx="3" fill="#2E86AB"/><rect x="345" y="282" width="6" height="16" rx="3" fill="#2E86AB"/>
  <rect x="325" y="278" width="20" height="28" rx="6" fill="#2E86AB"/><rect x="329" y="286" width="12" height="20" rx="3" fill="#FFFFFF"/>
  <circle cx="322" cy="299" r="3.5" fill="#F1C27D"/><circle cx="348" cy="299" r="3.5" fill="#F1C27D"/>
  <circle cx="335" cy="266" r="13" fill="#F1C27D"/>
  <path d="M321 263a14 12 0 0 1 28 0z" fill="#E4572E"/><rect x="320" y="262" width="30" height="3" rx="1.5" fill="#C9431F"/>
  <circle cx="330" cy="270" r="1.6" fill="#2B2B2B"/><circle cx="340" cy="270" r="1.6" fill="#2B2B2B"/>
  <path d="M331 274q4 3 8 0" fill="none" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/>
  ${showGrandma ? grandma() : ''}
  ${cat(catMood)}
  ${opts.time === 'night' ? '<rect x="0" y="0" width="600" height="380" fill="#0B1A33" opacity=".28"/>' : ''}
</svg>`;
  }
  return { render };
});
