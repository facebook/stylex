/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

export const viewBox = '0 0 644 435';

export function LogoText() {
  return (
    <g fill="var(--color-fd-card-foreground)" fillRule="nonzero">
      <path d="M85.547 161.625v16.563C70.964 168.395 57.839 163.5 46.172 163.5c-8.646 0-15.938 2.344-21.875 7.031-5.938 4.688-8.906 10.469-8.906 17.344 0 4.896 1.796 9.401 5.39 13.516 3.594 4.114 13.542 9.297 29.844 15.547s26.953 12.76 31.953 19.53c5 6.772 7.5 14.324 7.5 22.657 0 11.146-4.531 20.547-13.594 28.203-9.062 7.656-20.26 11.485-33.593 11.485-14.48 0-28.855-4.375-43.125-13.125v-15c16.979 8.75 32.03 13.125 45.156 13.125 8.854 0 16.12-2.344 21.797-7.032 5.677-4.687 8.515-10.677 8.515-17.969 0-5-1.849-9.609-5.546-13.828-3.698-4.218-13.698-9.557-30-16.015-16.303-6.459-26.876-12.839-31.72-19.14C3.126 203.525.704 196.52.704 188.811c0-10.937 4.505-20.234 13.516-27.89 9.01-7.656 19.974-11.484 32.89-11.484 11.771 0 24.584 4.062 38.438 12.187ZM147.89 104.594v47.656h40.313v12.5h-40.312v85.469c0 13.75 1.12 22.786 3.359 27.11 2.24 4.322 8.255 6.483 18.047 6.483 7.5 0 16.25-2.343 26.25-7.03v14.687c-10.104 4.896-20 7.344-29.688 7.344-9.479 0-17.395-2.709-23.75-8.125-6.354-5.417-9.53-12.917-9.53-22.5V164.75h-38.75v-12.5h38.75v-34.219l10.468-13.437h4.844ZM331.797 152.25l-107.5 217.344h-15.625l50.157-101.406-60.47-115.938h16.095l52.187 100.625 49.53-100.625zM367.735 77.719v218.28h-15.47V77.72zM522.422 218.813H409.14c-.313 2.5-.47 5-.47 7.5 0 16.041 5.73 29.635 17.188 40.78 11.459 11.147 25 16.72 40.625 16.72 18.23 0 36.042-7.136 53.438-21.407v17.344c-16.458 12.708-34.896 19.063-55.313 19.063-20.729 0-37.864-7.188-51.406-21.563-13.542-14.375-20.312-32.656-20.312-54.844 0-21.041 6.25-38.463 18.75-52.265s28.229-20.703 47.187-20.703c17.813 0 32.865 6.223 45.156 18.671 12.292 12.448 18.438 29.35 18.438 50.703Zm-111.25-12.344h93.125c-5.417-28.021-20.573-42.031-45.469-42.031-11.77 0-21.953 3.671-30.547 11.015-8.594 7.344-14.297 17.682-17.11 31.016Z" />
    </g>
  );
}

export default function Logo({ xstyle }: { xstyle?: stylex.StyleXStyles }) {
  const idA = 'a';
  const idB = 'b';
  const idC = 'c';
  const idD = 'd';
  const idE = 'e';
  const idF = 'f';
  const idG = 'g';
  const idH = 'h';

  return (
    <svg {...stylex.props(xstyle)} viewBox={viewBox}>
      <defs>
        <radialGradient
          cx="62.144%"
          cy="40.669%"
          fx="62.144%"
          fy="40.669%"
          id={idC}
          r="55.819%"
        >
          <stop offset="0%" stopColor="#E5F9FF" />
          <stop offset="21.605%" stopColor="#B2EEFE" />
          <stop offset="57.356%" stopColor="#5ED9FB" />
          <stop offset="77.207%" stopColor="#5DD1F1" />
          <stop offset="100%" stopColor="#55C4E3" />
        </radialGradient>
        <radialGradient
          cx="69.561%"
          cy="37.427%"
          fx="69.561%"
          fy="37.427%"
          id={idF}
          r="62.945%"
        >
          <stop offset="0%" stopColor="#FCD5FD" />
          <stop offset="19.619%" stopColor="#FD9EFF" />
          <stop offset="51.352%" stopColor="#F53BFA" />
          <stop offset="82.291%" stopColor="#E22FE6" />
          <stop offset="100%" stopColor="#CF28D4" />
        </radialGradient>
        <linearGradient
          id={idA}
          x1="40.797%"
          x2="74.283%"
          y1="31.719%"
          y2="59.893%"
        >
          <stop offset="0%" stopColor="var(--fg1)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--fg1)" />
        </linearGradient>
        <linearGradient
          id={idB}
          x1="42.442%"
          x2="64.703%"
          y1="56.078%"
          y2="39.384%"
        >
          <stop offset="0%" stopColor="var(--fg1)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--fg1)" />
        </linearGradient>
        <filter
          filterUnits="objectBoundingBox"
          height="133.3%"
          id={idE}
          width="133.3%"
          x="-16.7%"
          y="-16.7%"
        >
          <feGaussianBlur
            in="SourceAlpha"
            result="shadowBlurInner1"
            stdDeviation="2"
          />
          <feOffset
            dx="1"
            dy="-1"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2="-1"
            k3="1"
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.102873689 0"
          />
        </filter>
        <filter
          filterUnits="objectBoundingBox"
          height="124.1%"
          id={idH}
          width="124.1%"
          x="-12.1%"
          y="-12.1%"
        >
          <feGaussianBlur
            in="SourceAlpha"
            result="shadowBlurInner1"
            stdDeviation="3"
          />
          <feOffset
            dx="1"
            dy="-1"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            k2="-1"
            k3="1"
            operator="arithmetic"
            result="shadowInnerInner1"
          />
          <feColorMatrix
            in="shadowInnerInner1"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
        </filter>
        <circle cx="277.734" cy="367.5" id={idD} r="7.5" />
        <circle cx="622.734" cy="284.5" id={idG} r="14.5" />
      </defs>
      <g fill="none" fillRule="evenodd">
        <LogoText />
        <path
          d="M592.523 234.281a838.684 838.684 0 0 1 6.877 16.581c-13.356 22.14-29.751 44.864-49.208 67.727-113.618 117.646-201.28 136.658-254.998 81.696-5.248-5.606-9.901-12.896-13.96-21.87 1.143 2.058 2.654 4.327 4.531 6.804l.678.883.35.448.724.91.754.926.785.944.815.961.846.979.876.996.907 1.014.937 1.03.48.522.983 1.057.503.535 1.029 1.083.525.548c66.356 60.072 153.764 9.75 243.634-89.828 20.348-23.663 37.68-48.481 51.525-73.212l.407-.734Zm18.515-197.028c42.053 36.145 43.786 105.44 3.941 185.356a712.103 712.103 0 0 0-7.626-17.884c30.067-67.4 32.169-130.259-3.548-162.514-20.546-18.555-43.44-20.04-71.22-15.521l-1.818.303-.915.157-1.84.328-1.854.342-.932.177-21.905 4.338v-.04l.482-.176c43.96-16.015 81.711-17.294 107.235 5.134Z"
          fill={`url(#${idA})`}
          transform="translate(-.234)"
        />
        <path
          d="M626.134 394.744c-9.275 19.494-14.304 23.688-30.7 33.493-21.184 12.668-66.138 5.808-106.006-5.873l-5.976-2.544c20.034 6.443 63.57 14.86 87.042 8.417 49.506-13.589 65.23-57.568 49.621-125.419.853.12 1.729.182 2.62.182a18.42 18.42 0 0 0 11.426-3.95c6.801 39.765 3.206 72.082-8.027 95.694Zm-46.74-236.822c22.66 39.758 38.04 76.096 47.272 108.497a18.517 18.517 0 0 0-3.932-.419 18.425 18.425 0 0 0-11.878 4.316c-10.156-30.382-25.404-64.527-45.577-101.999C487.801 24.4 398.683-11.873 331.862 15.262c-6.417 2.606-12.01 6.166-16.823 10.575l.515-.549 1.033-1.084c.172-.179.345-.357.518-.534l1.038-1.054c7.452-7.475 15.18-13.311 23.142-15.997 60.427-20.382 151.87 0 238.108 151.303Z"
          fill={`url(#${idB})`}
          transform="translate(-.234)"
        />
        <g transform="translate(-.234)">
          <use fill={`url(#${idC})`} xlinkHref="#d" />
          <use fill="var(--fg1)" filter={`url(#${idE})`} xlinkHref="#d" />
        </g>
        <g transform="translate(-.234)">
          <use fill={`url(#${idF})`} xlinkHref="#g" />
          <use fill="var(--fg1)" filter={`url(#${idH})`} xlinkHref="#g" />
        </g>
      </g>
    </svg>
  );
}
