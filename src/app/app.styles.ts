import { ThemeVariables } from '@alyle/ui';

export const styles = (theme: ThemeVariables) => ({
  '@global': {
    body: {
      backgroundColor: theme.background.default,
      color: theme.text.default,
      fontFamily: theme.typography.fontFamily,
      margin: 0,
      padding: '2em'
    }
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  cropping: {
    maxWidth: '400px',
    height: '300px',
  },
  icon: {
    marginAfter: '.25em'
  },
  range: {
    textAlign: 'center',
    maxWidth: '400px'
  },
  rangeInput: {
    maxWidth: '150px',
    margin: '1em 0',

    // styles for slider
    // http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html
    // removes default webkit styles
    '-webkit-appearance': 'none',

    // fix for FF unable to apply focus style bug
    border: `solid 6px ${theme.background.default}`,

    // required for proper track sizing in FF
    width: '100%',
    '&::-webkit-slider-runnable-track': {
      width: '300px',
      height: '3px',
      background: '#ddd',
      border: 'none',
      borderRadius: '3px'
    },
    '&::-webkit-slider-thumb': {
      '-webkit-appearance': 'none',
      border: 'none',
      height: '16px',
      width: '16px',
      borderRadius: '50%',
      background: theme.primary.default,
      marginTop: '-6px'
    },
    '&:focus': {
      outline: 'none'
    },
    '&:focus::-webkit-slider-runnable-track': {
      background: '#ccc'
    },

    '&::-moz-range-track': {
      width: '300px',
      height: '3px',
      background: '#ddd',
      border: 'none',
      borderRadius: '3px'
    },
    '&::-moz-range-thumb': {
      border: 'none',
      height: '16px',
      width: '16px',
      borderRadius: '50%',
      background: theme.primary.default
    },

    // hide the outline behind the border
    '&:-moz-focusring': {
      outline: '1px solid white',
      outlineOffset: '-1px',
    },

    '&::-ms-track': {
      width: '300px',
      height: '3px',

      // remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead
      background: 'transparent',

      // leave room for the larger thumb to overflow with a transparent border
      borderColor: 'transparent',
      borderWidth: '6px 0',

      // remove default tick marks
      color: 'transparent'
    },
    '&::-ms-fill-lower': {
      background: '#777',
      borderRadius: '10px'
    },
    '&::-ms-fill-': {
      background: '#ddd',
      borderRadius: '10px',
    },
    '&::-ms-thumb': {
      border: 'none',
      height: '16px',
      width: '16px',
      borderRadius: '50%',
      background: theme.primary.default,
    },
    '&:focus::-ms-fill-lower': {
      background: '#888'
    },
    '&:focus::-ms-fill-upper': {
      background: '#ccc'
    }
  }
});
