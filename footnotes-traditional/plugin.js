tinymce.PluginManager.add('footnotes-traditional', function(editor, url) {
    /**
     * Remove a footnote link using its HREF - i.e., the footnote it's linking to.
     * @param {string} reference 
     */
    var removeFootnoteLinkByReference = function(reference) {
        var footnoteLinks = editor.dom.select('[aria-describedby="footnote-header"]');
        for (var i = 0; i < footnoteLinks.length; i++) {
            if (footnoteLinks[i].attributes['href'].textContent == reference) {
                editor.dom.remove(footnoteLinks[i]);
            }
        }
    };

    /**
     * Remove a footnote and the link to it. The applicable footnote is chosen by placement of teh caret.
     * 
     * The caret can be in one of three places:
     *   1. On the link to the footnote.
     *   2. On the footnote itself.
     *   2. On the footnote, but at the end of the note, on the back-link.
     */
    var removeFootnote = function() {
        editor.undoManager.transact(function() {
            // (1) Caret is on the link to the footnote
            if (editor.selection.getNode().attributes['aria-describedby'] != undefined) {
                if (editor.selection.getNode().attributes['aria-describedby'].textContent == 'footnote-header') {
                    var footnoteLinkId = editor.selection.getNode().id;
                    var footnoteReference = editor.selection.getNode().attributes['href'].textContent.substring(1);

                    editor.dom.remove(footnoteLinkId);
                    editor.dom.remove(footnoteReference);
                }
            }
            // (2) Caret is on the footnote itself
            else if (editor.selection.getNode().parentNode.id == 'footnote-list') {
                var footnoteLinkReference = '#' + editor.selection.getNode().id;
                removeFootnoteLinkByReference(footnoteLinkReference);
                editor.dom.remove(editor.selection.getNode().id);
            }
            // (3) Caret is on the footnote, but at the end of the note, on the back-link
            else if (editor.selection.getNode().className == 'footnote-return-link') {
                var footnoteLinkReference = '#' + editor.selection.getNode().parentNode.id;
                removeFootnoteLinkByReference(footnoteLinkReference);
                editor.dom.remove(editor.selection.getNode().parentNode.id);
            }

            // If the footnote list is empty, remove it and the footnote heading
            if (editor.dom.select('#footnote-list > li').length == 0) {
                editor.dom.remove('footnote-header');
                editor.dom.remove('footnote-list');
            }
        });
    };

    /**
     * Insert a footnote at the caret position. Opens a dialog first for the user to write the footnote content.
     * @returns nothing
     */
    var addFootnote = function() {
        return editor.windowManager.open({
            title: 'Insert Footnote',
            body: {
                type: 'panel',
                items: [{
                    type: 'textarea',
                    name: 'footnoteContent',
                    multiline: true,
                    minWidth: 520,
                    minHeight: 100,
                }]
            },
            buttons: [{
                    type: 'cancel',
                    text: 'Close'
                },
                {
                    type: 'submit',
                    text: 'Save',
                    primary: true
                }
            ],
            onSubmit: function(api) {
                var data = api.getData();

                editor.undoManager.transact(function() {
                    var list = editor.dom.get('footnote-list');

                    // If there isn't an existing list of footnotes, create one
                    if (list == null) {
                        var footnoteLink = editor.dom.create('a', { id: 'footnote-ref-1', href: '#footnote-1', 'aria-describedby': 'footnote-header' }, '[1]');
                        editor.selection.setNode(footnoteLink);

                        var newList = editor.dom.create('ol', { id: 'footnote-list' });
                        var newItem = editor.dom.create('li', { id: 'footnote-1' }, data.footnoteContent);
                        var returnLink = editor.dom.create('a', { class: 'footnote-return-link', href: '#footnote-ref-1', 'aria-label': 'Back to content' }, '&crarr;');

                        newItem.append(returnLink);
                        newList.append(newItem);

                        editor.dom.add(editor.getBody(), 'h2', { id: 'footnote-header' }, 'Footnotes');
                        editor.dom.add(editor.getBody(), newList);
                    }
                    // If a list of footnotes already exists, add to it
                    else {
                        // Insert the footnote link
                        var footnoteLink = editor.dom.create('a', { id: 'footnote-ref-x', href: '#footnote-x', 'aria-describedby': 'footnote-header' }, '[X]');
                        editor.selection.setNode(footnoteLink);

                        var footnoteLinkCount = 1;
                        var footnoteListCount = 1;
                        var footnoteInsertPosition = 0;

                        // Cycle through all of the footnote links, re-numbering them
                        editor.dom.select('[aria-describedby="footnote-header"]').forEach(element => {
                            var id = editor.dom.getAttrib(element, 'id');

                            // Note where the new footnote has been inserted so that we know where to insert the corresponding footnote in the footnote list
                            if (id == 'footnote-ref-x') {
                                footnoteInsertPosition = footnoteLinkCount;
                            }

                            editor.dom.setAttrib(element, 'id', 'footnote-ref-' + footnoteLinkCount);
                            editor.dom.setAttrib(element, 'href', '#footnote-' + footnoteLinkCount);
                            editor.dom.setHTML(element, '[' + footnoteLinkCount + ']');

                            footnoteLinkCount++;
                        });

                        // Special case: the new footnote is the first footnote
                        if (footnoteInsertPosition == 1) {
                            var returnLink = editor.dom.create('a', { class: 'footnote-return-link', href: '#footnote-ref-x', 'aria-label': 'Back to content' }, '&crarr;');
                            var newItem = editor.dom.create('li', { id: 'footnote-x' }, data.footnoteContent);
                            newItem.append(returnLink);
                            editor.dom.get('footnote-list').prepend(newItem);
                        }

                        // Cycle through all of the footnotes and re-do their ids and back-links
                        editor.dom.select('#footnote-list > li').forEach(element => {
                            // Do nothing because inserting a new footnote wouldn't have affected this item
                            if (footnoteListCount < footnoteInsertPosition - 1) {}
                            // Insert the new footnote
                            else if (footnoteListCount == footnoteInsertPosition - 1) {
                                var returnLink = editor.dom.create('a', { class: 'footnote-return-link', href: '#footnote-ref-' + (footnoteListCount + 1), 'aria-label': 'Back to content' }, '&crarr;');
                                var newItem = editor.dom.create('li', { id: 'footnote-' + (footnoteListCount + 1) }, data.footnoteContent);
                                newItem.append(returnLink);
                                editor.dom.insertAfter(newItem, element);
                                footnoteListCount++

                            }
                            // Re-do the footnote's id and back-link because of the new footnote
                            else {
                                editor.dom.setAttrib(element, 'id', 'footnote-' + footnoteListCount);
                                var newReturnLink = editor.dom.create('a', { class: 'footnote-return-link', href: '#footnote-ref-' + footnoteListCount, 'aria-label': 'Back to content' }, '&crarr;');
                                var oldReturnLink = element.querySelector('.footnote-return-link');
                                editor.dom.insertAfter(newReturnLink, oldReturnLink);
                                oldReturnLink.remove();
                            }

                            footnoteListCount++;
                        });
                    }
                });

                api.close();
            }
        });
    };

    /*** Icons ***/
    editor.ui.registry.addIcon('footnote-add', '<svg height="24" width="24" clip-rule="evenodd" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1.5" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m16.661 5.497-4.073-2.948h-10.339v18.578h14.412v-15.63z" fill="none" stroke="#000" stroke-width="1.5px"/><path d="m11.361 2.718v4.012h5.014" fill="none" stroke="#000" stroke-width="1.5px"/><path d="m5.328 11.199h4.95" fill="none" stroke="#000" stroke-width="1px"/><path d="m5.328 13.244h7.978" fill="none" stroke="#000" stroke-width="1px"/><rect x="5.303" y="15.674" width="8.074" height="2.625" fill="none" stroke="#000" stroke-width="1px"/><path d="m12.498 10.72h0.53" fill="none" stroke="#000" stroke-width="1px"/><path d="m20.041 9.331h2.331v8.499h-2.331" fill="none" stroke="#000" stroke-width="1.5px"/><path d="m19.769 16.719-0.71 0.984 0.655 1.08" fill="none" stroke="#000" stroke-width="1px"/></svg>');
    editor.ui.registry.addIcon('footnote-remove', '<svg height="24" width="24" clip-rule="evenodd" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1.5" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m16.661 5.497l-4.073-2.948h-10.339v18.578h14.412v-15.63z" fill="none" stroke="#000" stroke-width="1.5px"/><path d="m11.361 2.718v4.012h5.014" fill="none" stroke="#000" stroke-width="1.5px"/><path d="m5.328 11.199h4.95" fill="none" stroke="#000" stroke-width="1px"/><path d="m5.328 13.244h7.978" fill="none" stroke="#000" stroke-width="1px"/><rect x="5.303" y="15.674" width="8.074" height="2.625" fill="none" stroke="#000" stroke-width="1px"/><path d="m12.498 10.72h0.53" fill="none" stroke="#000" stroke-width="1px"/><path d="m20.041 9.331h2.331v8.499h-2.331" fill="none" stroke="#000" stroke-width="1.5px"/><path d="m19.769 16.719l-0.71 0.984 0.655 1.08" fill="none" stroke="#000" stroke-width="1px"/><path d="m1.34 22.438l19.65-19.651" fill="none" stroke="#000" stroke-width="2px"/></svg>    ');

    /*** Split Button ***/
    editor.ui.registry.addSplitButton('footnotes-traditional', {
        // text: 'Footnotes',
        icon: 'footnote-add',
        tooltip: 'Add a footnote',
        onAction: function() {
            addFootnote();
        },
        onItemAction: function(api, value) {
            removeFootnote();
        },
        fetch: function(callback) {
            var items = [{
                type: 'choiceitem',
                icon: 'footnote-remove',
                text: 'Remove Footnote',
                value: 'remove'
            }];
            callback(items);
        }
    });

    /*** Individual Buttons ***/
    editor.ui.registry.addButton('footnotes-traditional-add', {
        // text: 'Add Footnote',
        icon: 'footnote-add',
        tooltip: 'Add a footnote',
        onAction: function() {
            addFootnote();
        }
    });

    editor.ui.registry.addButton('footnotes-traditional-remove', {
        // text: 'Remove Footnote',
        icon: 'footnote-remove',
        tooltip: 'Remove a footnote',
        onAction: function() {
            removeFootnote();
        }
    });

    /*** Menu Items ***/
    editor.ui.registry.addMenuItem('footnotes-traditional-add', {
        text: 'Add Footnote',
        icon: 'footnote-add',
        onAction: function() {
            addFootnote();
        }
    });

    editor.ui.registry.addMenuItem('footnotes-traditional-remove', {
        text: 'Remove Footnote',
        icon: 'footnote-remove',
        onAction: function() {
            removeFootnote();
        }
    });

    // Return the metadata for the plugin
    return {
        getMetadata: function() {
            return {
                name: 'Traditional Footnotes',
                url: 'http://exampleplugindocsurl.com'
            };
        }
    };
});