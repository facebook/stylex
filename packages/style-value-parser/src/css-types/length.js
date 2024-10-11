/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { number } from './number';

// All units are numeric
export class Length {
  +value: number;
  +unit: string = '';

  constructor(value: number, unit?: string) {
    this.value = value;
    this.unit = unit ?? '';
  }

  toString(): string {
    return `${this.value}${this.unit}`;
  }

  static get parse(): Parser<Length> {
    return Parser.oneOf(
      LengthBasedOnFont.parse,
      LengthBasedOnViewport.parse,
      LengthBasedOnContainer.parse,
      LengthBasedOnAbsoluteUnits.parse,

      // If nothing else, check for a plain `0`
      Parser.string('0').map(() => new Length(0)),
    );
  }
}

export class LengthBasedOnFont extends Length {
  static get parse(): Parser<Length> {
    return Parser.oneOf(
      /// Relative length units based on font
      /// https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_font
      // Cap.parse, // Not well supported in browsers
      Ch.parse,
      Em.parse,
      Ex.parse,
      Ic.parse,
      Lh.parse, // Not well supported in browsers
      Rem.parse,
      Rlh.parse, // Not well supported in browsers

      // If nothing else, check for a plain `0`
      // Parser.string('0').map(() => new Length(0)),
    );
  }
}

export class LengthBasedOnViewport extends Length {
  static get parse(): Parser<Length> {
    return Parser.oneOf(
      /// https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport
      Vh.parse,
      Svh.parse,
      Lvh.parse,
      Dvh.parse,
      Vw.parse,
      Svw.parse,
      Lvw.parse,
      Dvw.parse,
      Vmin.parse,
      Svmin.parse,
      Lvmin.parse,
      Dvmin.parse,
      Vmax.parse,
      Svmax.parse,
      Lvmax.parse,
      Dvmax.parse,
    );
  }
}

export class LengthBasedOnContainer extends Length {
  toString(): string {
    return `${this.value}${this.unit}`;
  }

  static get parse(): Parser<Length> {
    return Parser.oneOf(
      /// https://developer.mozilla.org/en-US/docs/Web/CSS/length#container_query_length_units
      Cqw.parse,
      Cqi.parse,
      Cqh.parse,
      Cqb.parse,
      Cqmin.parse,
      Cqmax.parse,
    );
  }
}

export class LengthBasedOnAbsoluteUnits extends Length {
  toString(): string {
    return `${this.value}${this.unit}`;
  }

  static get parse(): Parser<Length> {
    return Parser.oneOf(
      /// https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units
      Px.parse,
      Cm.parse,
      Mm.parse,
      In.parse,
      Pt.parse,
    );
  }
}

function unit<T: Length>(unit: string, Constructor: Class<T>): Parser<T> {
  return number.skip(Parser.string(unit)).map((v) => new Constructor(v));
}

/// ====================
/// Relative length units based on font
/// https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_font
/// ====================

export class Cap extends Length {
  unit: 'cap' = 'cap';

  static get parse(): Parser<Cap> {
    return unit('cap', Cap);
  }
}

export class Ch extends Length {
  unit: 'ch' = 'ch';

  static parse: Parser<Ch> = unit('ch', Ch);
}

export class Em extends Length {
  unit: 'em' = 'em';

  static parse: Parser<Em> = unit('em', Em);
}

export class Ex extends Length {
  unit: 'ex' = 'ex';

  static parse: Parser<Ex> = unit('ex', Ex);
}

export class Ic extends Length {
  unit: 'ic' = 'ic';

  static parse: Parser<Ic> = unit('ic', Ic);
}

export class Lh extends Length {
  unit: 'lh' = 'lh';

  static parse: Parser<Lh> = unit('lh', Lh);
}

export class Rem extends Length {
  unit: 'rem' = 'rem';

  static parse: Parser<Rem> = unit('rem', Rem);
}

export class Rlh extends Length {
  unit: 'rlh' = 'rlh';

  static parse: Parser<Rlh> = unit('rlh', Rlh);
}

/// ====================
/// Viewport-based length units
/// https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport
/// ====================

export class Vh extends Length {
  unit: 'vh' = 'vh';

  static parse: Parser<Vh> = unit('vh', Vh);
}
export class Svh extends Length {
  unit: 'svh' = 'svh';

  static parse: Parser<Svh> = unit('svh', Svh);
}
export class Lvh extends Length {
  unit: 'lvh' = 'lvh';

  static parse: Parser<Lvh> = unit('lvh', Lvh);
}
export class Dvh extends Length {
  unit: 'dvh' = 'dvh';

  static parse: Parser<Dvh> = unit('dvh', Dvh);
}
export class Vw extends Length {
  unit: 'vw' = 'vw';

  static parse: Parser<Vw> = unit('vw', Vw);
}
export class Svw extends Length {
  unit: 'svw' = 'svw';

  static parse: Parser<Svw> = unit('svw', Svw);
}
export class Lvw extends Length {
  unit: 'lvw' = 'lvw';

  static parse: Parser<Lvw> = unit('lvw', Lvw);
}
export class Dvw extends Length {
  unit: 'dvw' = 'dvw';

  static parse: Parser<Dvw> = unit('dvw', Dvw);
}
export class Vmin extends Length {
  unit: 'vmin' = 'vmin';

  static parse: Parser<Vmin> = unit('vmin', Vmin);
}
export class Svmin extends Length {
  unit: 'svmin' = 'svmin';

  static parse: Parser<Svmin> = unit('svmin', Svmin);
}
export class Lvmin extends Length {
  unit: 'lvmin' = 'lvmin';

  static parse: Parser<Lvmin> = unit('lvmin', Lvmin);
}
export class Dvmin extends Length {
  unit: 'dvmin' = 'dvmin';

  static parse: Parser<Dvmin> = unit('dvmin', Dvmin);
}
export class Vmax extends Length {
  unit: 'vmax' = 'vmax';

  static parse: Parser<Vmax> = unit('vmax', Vmax);
}
export class Svmax extends Length {
  unit: 'svmax' = 'svmax';

  static parse: Parser<Svmax> = unit('svmax', Svmax);
}
export class Lvmax extends Length {
  unit: 'lvmax' = 'lvmax';

  static parse: Parser<Lvmax> = unit('lvmax', Lvmax);
}
export class Dvmax extends Length {
  unit: 'dvmax' = 'dvmax';

  static parse: Parser<Dvmax> = unit('dvmax', Dvmax);
}

/// ====================
/// Container Query Length Units
/// https://developer.mozilla.org/en-US/docs/Web/CSS/length#container_query_length_units
/// ====================

export class Cqw extends Length {
  unit: 'cqw' = 'cqw';

  static parse: Parser<Cqw> = unit('cqw', Cqw);
}
export class Cqi extends Length {
  unit: 'cqi' = 'cqi';

  static parse: Parser<Cqi> = unit('cqi', Cqi);
}
export class Cqh extends Length {
  unit: 'cqh' = 'cqh';

  static parse: Parser<Cqh> = unit('cqh', Cqh);
}
export class Cqb extends Length {
  unit: 'cqb' = 'cqb';

  static parse: Parser<Cqb> = unit('cqb', Cqb);
}
export class Cqmin extends Length {
  unit: 'cqmin' = 'cqmin';

  static parse: Parser<Cqmin> = unit('cqmin', Cqmin);
}
export class Cqmax extends Length {
  static parse: Parser<Cqmax> = unit('cqmax', Cqmax);
}

/// ====================
/// Absolute length units
/// https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units
/// ====================

export class Px extends Length {
  unit: 'px' = 'px';

  static parse: Parser<Px> = unit('px', Px);
}
export class Cm extends Length {
  unit: 'cm' = 'cm';

  static parse: Parser<Cm> = unit('cm', Cm);
}
export class Mm extends Length {
  unit: 'mm' = 'mm';

  static parse: Parser<Mm> = unit('mm', Mm);
}
export class In extends Length {
  unit: 'in' = 'in';

  static parse: Parser<In> = unit('in', In);
}
export class Pt extends Length {
  unit: 'pt' = 'pt';

  static parse: Parser<Pt> = unit('pt', Pt);
}

// TODO: CALC
