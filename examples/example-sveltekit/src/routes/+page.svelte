<script lang="ts">
  let count = $state(0);
</script>

<div {...stylex.attrs(styles.main)}>
  <div {...stylex.attrs(styles.card)}>Count</div>
  <button {...stylex.attrs(styles.button)} onclick={() => count++}>{count}</button>
</div>

<script lang="ts" module>
  import * as stylex from '@stylexjs/stylex';

  const styles = stylex.create({
    main: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'lightblue',
    },
    card: {
      backgroundColor: '#fefefe',
      padding: '1rem',
      borderRadius: 10,
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
      color: '#333',
      fontFamily: 'Arial',
    },
    button: {
      appearance: 'none',
      borderStyle: 'none',
      paddingInline: 32,
      paddingBlock: 12,
      borderRadius: 4,
      backgroundColor: '#333',
      color: '#fefefe',
      cursor: 'pointer',
      scale: {
        default: 1,
        ':hover': 1.01,
        ':active': 0.98,
      },
      transitionProperty: 'scale',
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-in-out',
    }
  });
</script>
