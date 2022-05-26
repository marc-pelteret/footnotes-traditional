# Traditional Footnotes Plugin for TinMCE 6

Creates accessible footnotes at the bottom of the body of text.

Footnotes are inserted at the bottom of the text under a header. Each footnote has a link to it in the body of the text and a link to return to its link in the body.

## HTML Produced

```html
<p>Hello, World!<a id="footnote-ref-1" href="#footnote-1" aria-describedby="footnote-header">[1]</a></p>
<h2 id="footnote-header">Footnotes</h2>
<ol id="footnote-list">
<li id="footnote-1">Test footnote.<a class="footnote-return-link" href="#footnote-ref-1" aria-label="Back to content">&crarr;</a></li>
</ol>
```

## CSS Styling

Footnote link: a[aria-describedby="footnote-header"]
Footnote list header: #footnote-header
Footnote list: #footnote-list
Footnote list item: #footnote-list > li

## Installation

Download and copy the folder "traditional-footnotes" to your TinyMCE plugins folder, or load it as an external plugin, and add **'footnotes-traditional'** to the plugins list.

```javascript
tinymce.init({
  selector: 'mytextarea',  // Change this value according to your HTML
  external_plugins: {
    pluginId: '/js/footnotes-traditional/plugin.min.js'
  },
  plugins: ['footnotes-traditional'],
});

```

## Usage

Add a split button, which has both the add and remove buttons, to the toolbar:

```
toolbar: 'footnotes-traditional'
```

Or add two individual buttons:

```
toolbar: 'footnotes-traditional-add footnotes-traditional-remove'
```

You can also add menu items:

```
menubar: 'file edit custom',
menu: {
   custom: { title: 'Custom Menu', items: 'undo redo footnotes-traditional-add footnotes-traditional-remove' }
},
```

All together:

```javascript
tinymce.init({
  selector: 'mytextarea',  // Change this value according to your HTML
  plugins: ['footnotes-traditional'],
  toolbar: 'footnotes-traditional',
  menubar: 'file edit custom',
  menu: {
     custom: { title: 'Custom Menu', items: 'undo redo footnotes-traditional-add footnotes-traditional-remove' }
  },
});
```