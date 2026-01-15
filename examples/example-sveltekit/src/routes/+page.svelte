<script lang="ts" module>
  import * as stylex from '@stylexjs/stylex';
  import { attrs } from '$lib';

  const styles = stylex.create({
    main: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
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
  });
</script>


<div {...attrs(stylex.props(styles.main))}>
  <div {...attrs(stylex.props(styles.card))}>Content</div>
</div>