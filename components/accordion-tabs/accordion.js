jQuery(document).ready(function($) {
    $( "#accordion:nth-child(1n)" ).accordion({
        heightStyle: "content",
        active: false,
        collapsible: true
    });
    $( "#tabs").tabs();
});