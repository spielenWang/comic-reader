var request = require('request');
const values = require('./values');
var subscriber = require('./subscriber');

module.exports = {
    selectComic: selectComic
}
/**
 *      Variable Definition
 */

var chapterEntryStr = "";
var curHost = "";
var curTitleKey = "";
var curChapterList = [];
var curChapterIdx = -1;
var pageContainerStr = "";
var pageIds = [];
var curPageId = 0;

function selectComic(host, link, title, titleKey, imguri) {
    $("#comic-header .comic-title").html(title);
    $("#comic-header").attr("host", host);
    $("#comic-header").attr("link", link);
    $("#comic-header").attr("title", title);
    $("#comic-header").attr("titlekey", titleKey);
    curHost = host;
    curTitleKey = titleKey;
    curChapterList = [];
    curChapterIdx = -1;

    $("#comic-header .subscribe-btn").click(function(e) {
        e.stopPropagation();
        subscriber.subscribe(host, titleKey, title, link, imguri);
    });

    request({
        methos: 'GET',
        uri: link
    }, onChaptersGraped);
    $(".middle-panel .loading-bg").removeClass("is-hidden");
    subscriber.updateUI();
    $("#tab-read").trigger("click");
}

function onChaptersGraped(error, response, body){
    var hostpath = response.request.host;
    var host = values.chapterhosts[hostpath].name;
    $("#chapter-selector").html("");
    switch(host) {
        case "sfacg":
            var tmp = $("table:nth-of-type(9)", "<div>" + body + "</div>").find("ul.serialise_list.Blue_link2");
            tmp.find("li").each(function(i, e) {
                var chName = $(e).text();
                var chLink = "http://" + hostpath + $(e).find('a').attr('href');
                var domid = "#chapter" + i;
                var view = createChapterEntry(chName, chLink, domid, i);
                curChapterList.push(domid);
                $("#chapter-selector").append(view);

            });
        break;
        default:
        break;
    }
    $(".middle-panel .loading-bg").addClass("is-hidden");

}

function selectChapter(chLink) {
    console.log(chLink);
    $("#read-area").html("");
    request({
        method: 'GET',
        uri: chLink
    }, onSingleChapterGraped)

}

function onSingleChapterGraped(error, response, body) {
    var hostpath = response.request.host;
    var host = values.chapterhosts[hostpath].name;

    switch(host) {
        case "sfacg":
            var tmp = $("<div>" + body + "</div>");
            var pagecount = tmp.find("#pageSel");
            var scripts = tmp.find("script").eq(1).attr("src");

            request({
                method: 'GET',
                uri: "http://" + hostpath + scripts
            }, utilParser);
            break;
        default:
            break;
    }

}


// this is only for sfacg.com
function utilParser (error, response, body) {
    var host = response.request.host;
    eval(body);
    pageIds = [];
    var pichost = hosts[0];
    for(idx in picAy) {
        imgurl = "http://" + host+picAy[idx];
        var id = "pic" + idx;
        pageIds.push(id);
        
        var view = createComicPage(imgurl, id, idx);
        $("#read-area").append(view);
    }
}


/**
 *      Initialization / UI
 */

function init() {
    $.get('./sections/chapter-entry.html', function(result) {
        chapterEntryStr = result;
    });

    $.get('./sections/page.html', function(result) {
        pageContainerStr = result;
    })
}

function lateInit() {
    // comic header click behavior in mobile view
    $("#comic-header").click(function(e) {
        if ($("#comic-header").css("top") == "50px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
    })
}

function createChapterEntry(chName, chLink, domid, index) {
    var view = $(chapterEntryStr);
    view.attr("link", chLink);
    view.attr("idx", index);
    view.attr("id", domid);

    view.html(chName);
    view.click(function(){
        if ($("#comic-header").css("top") == "50px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
        selectChapter(chLink);
    });
    return view;
}

function createComicPage(imguri, id, idx) {
    // var obj = $("<div class='pure-u-1 comic-page-container' idx='" + idx + "' id='pic" + idx + "'></div>");
        // obj.append("<img class='comic-page' src='" + imgurl + "'>");
        var view = $(pageContainerStr);
        view.attr("id", id);
        view.attr("idx", idx);
        view.find("img").attr("src", imguri);
        return view;
}

function toggleChapterSelector() {
    if ($("#chapter-selector").hasClass("is-hidden-mobile")) {
        $("#chapter-selector").removeClass("is-hidden-mobile");
    } else {
        $("#chapter-selector").addClass("is-hidden-mobile");
    }
}

/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);