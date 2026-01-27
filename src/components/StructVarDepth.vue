<template>
  <div id="svholder" ref="svholder" class="child-component">
    <svg id="structVarReads" style="display: block;" height="500px" width="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="agg-gradient">
          <stop offset="0%" stop-color="green" />
          <stop offset="100%" stop-color="white" />
        </linearGradient>
      </defs>
      <clipPath id="depth-clip">
        <rect x="0%" y="0%" width="100%" height="100%"></rect>
      </clipPath>
      <g id="background">
        <rect height="100%" width="100%" opacity=0.1 fill="#AAAABB"></rect>
      </g>
      <g id="depths"></g>
      <g id="sv-bounds">
        <line id="sv-start" y0="0%" y1="100%" stroke="black" stroke-dasharray="2 1"/>
        <line id="sv-end"   y0="0%" y1="100%" stroke="black" stroke-dasharray="2 1"/>
      </g>
      <g id="alignments" style="visibility: hidden">
        <g id="split-reads"  class="sv__splits"></g>
        <g id="paired-reads" class="sv__pairs"></g>
      </g>
      <g id="aggregates"></g>
    </svg>
  </div>
  <button @click="toggle_visibility(svg.select('#alignments'))">Show/Hide Alignments</button>
  <button @click="toggle_visibility(svg.select('#aggregates'))">Show/Hide Aggregates</button>
  <div id="dbg-info">
  </div>
</template>
