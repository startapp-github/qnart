import { trigger, style, animate, transition } from '@angular/animations';

export const inAnimation = [
  trigger('inAnimation', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('0.5s ease-out', style({ opacity: 1 })),
    ]),
  ]),
];
export const inHeightAnimation = [
  trigger('inHeightAnimation', [
    transition(':enter', [
      style({ opacity: 0, minHeight: '4.5rem', transformOrigin: 'bottom' }),
      animate(
        '0.5s ease-in-out',
        style({ opacity: 1, minHeight: 'auto', transformOrigin: 'top' })
      ),
    ]),
  ]),
];
export const outAnimation = [
  trigger('outAnimation', [
    transition(':enter', [
      style({ opacity: 1 }),
      animate('0.8s ease-out', style({ opacity: 0 })),
    ]),
  ]),
];
