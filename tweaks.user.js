/* Copyright (c) 2013-2014 Kevin Ott (aka Etzos) <supercodingmonkey@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// ==UserScript==
// @name        NEaB Tweaks
// @namespace   http://garth.web.nowhere-else.org/web/
// @version     0.3.1
// @description Quick fixes for various bugs and issues with NEaB
// @updateURL   https://rawgit.com/Etzos/NEaB-Tweaks/master/tweaks.user.js

// @match       *://www.nowhere-else.org/nbase.php
// @match       *://nowhere-else.org/nbase.php
// @match       *://*.nowhere-else.org/nbase.php

// @match       *://www.nowhere-else.org/game.php*
// @match       *://nowhere-else.org/game.php*

// @match       *://nowhere-else.org/mapgrid.php*
// @match       *://*.nowhere-else.org/mapgrid.php*

// @match       *://nowhere-else.org/statue_scrubbing.php*
// @match       *://*.nowhere-else.org/statue_scrubbing.php*

// @match       *://nowhere-else.org/player_info.php*
// @match       *://*.nowhere-else.org/player_info.php*

// @require     https://rawgit.com/sizzlemctwizzle/GM_config/050978c9d41245b135404a3692ac42418a09be24/gm_config.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @copyright   2013-2014+, Kevin Ott
// @grants      none
// @run-at      document-end
// ==/UserScript==

// WARNING: Use this at your own risk!
// NOTE: I only use the classic NEaB skin, so I can't be sure it works with other skins. Sorry.

// -- Config Section -- //
GM_config.init({
    'HorizontalCombat': {
        'label': 'Combat: Make the combat layout more widescreen friendly.',
        'type': 'checkbox',
        'default': true
    },
    'HotkeyCombat': {
        'label': 'Combat: Fix hotkeys causing combat to blow up',
        'type': 'checkbox',
        'default': true
    },
    "FixCombatOverlay": {
        "label": "Combat: Fix the position and placement of the background overlay",
        "type": "checkbox",
        "default": true
    },
    "CombatDimBars": {
        "label": "Combat: Dim the HP and MP bars when the mouse is nearby",
        "type": "checkbox",
        "default": true
    },
    "MovableCombat": {
        "label": "Combat: Make the combat window movable",
        "type": "checkbox",
        "default": true
    },
    'MoveMapMessages': {
        'label': 'Map: Move the message box to the right side for better visibility',
        'type': 'checkbox',
        'default': true
    },
    'MoveMapUp': {
        'label': "Map: Move the 2d map view up to cover the area the embedded chat should be in",
        'type': 'checkbox',
        'default': true
    },
    'JournalDate': {
        'label': "Journal: Sort entries by date (most recent first)",
        'type': 'checkbox',
        default: false
    }
});

var Util = {
    /**
     * Properly gets the content window of a frame
     *
     * @param {string} frameID - The ID of the frame to get the contentWindow of
     * @returns {Window} The Window object of the frame
     */
    getFrameWin: function(frameID) {
        return document.getElementById(frameID).contentWindow;
    },
    /**
     * Returns the date postfix for a given day
     *
     * @param {number} number - The day of the month
     * @returns {string} The proper postfix for the day of the month
     */
    intPostfix: function(number) {
        // Special cases
        if(number < 1) {
            return "";
        } else if(number > 10 && number < 20) {
            return "th";
        }
        var leastSig = number % 10;
        switch(leastSig) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    },
    /**
     * Inserts a script into the body of the document
     *
     * @param {string} contents - The script to insert
     */
    insertScript: function(contents) {
        var script = document.createElement('script');
        script.setAttribute("type", "application/javascript");
        script.textContent = contents;
        document.body.appendChild(script);
        document.body.removeChild(script);
    }
}

var Fixes = {
    // Inserts the config for these scripts into the page
    insertConfig: function() {
        var $context = Util.getFrameWin('MENUFRAME').document;
        var table = $context.getElementsByTagName('table')[0].children[0].children[0];

        table.innerHTML += '<td><img src="images/vert_sep_3.gif" height="20" width="15"></td>' +
            "<td><a href='#' id='neab-tweak-settings' onClick='return false;'>NEaB Tweak Settings</a></td>";
        // Reload helper
        table.innerHTML += '<td><img src="images/vert_sep_3.gif" height="20" width="15"></td>' +
            '<td><a href="#" id="neab-tweak-reload-mainframe" onClick="return false;">Reload Content</a></td>';

        $context.getElementById('neab-tweak-settings').addEventListener('click', function() {
            GM_config.open();
        });
        $context.getElementById('neab-tweak-reload-mainframe').addEventListener('click', function() {
            Util.getFrameWin('MAINFRAME').location.reload();
            Util.getFrameWin('MAPGRID').location.reload();
        });
    },
    // Modifies combat to the horizontal layout
    horizontalCombat: function() {
        // Try to find the frame to modify
        var $top = window.top;
        var msf = $top.document.getElementById("MENU_SUBFRAME");
        var msfCont = $top.document.getElementById("DIV_SUBFRAME");

        var widthBy = 300;
        var heightBy = 150;
        msf.style.width = (parseInt(msf.style.width) + widthBy) + 'px';
        msf.style.height = (parseInt(msf.style.height) - heightBy) + 'px';

        msfCont.style.width = (parseInt(msfCont.style.width) + widthBy) + 'px';
        msfCont.style.height = (parseInt(msfCont.style.height) - heightBy) + 'px';

        msfCont.style.left = (parseInt(msfCont.style.left) - 150) + 'px';
        msf.style.left = (parseInt(msf.style.left) - 150) + 'px';

        // Move the message and chat boxes
        var $ref = document.getElementById("DIV_ACT_SELECT");

        var $mesBox = $ref.nextSibling;
        var $chatBox = $mesBox.nextSibling;
        var $chatInput = $chatBox.nextSibling;

        $mesBox.style.top = '0px';
        $mesBox.style.left = '650px';

        var $msg = document.getElementById("MESSAGES");
        $msg.style.height = '220px';

        $chatBox.style.top = '250px';
        $chatBox.style.left = '650px';

        document.getElementById("CHATLOG").style.height = '170px';

        $chatInput.style.top = '455px';
        $chatInput.style.left = '650px';
    },
    // Moves the message box
    mapMoveMessageBox: function() {
        document.getElementById("MESSAGES").style.right = '5px';
    },
    // Reseets and modifies the statue pages
    resetStatueBoxes: function($input) {
        var originalVal = $input.value;
        var $parent = $input.parentElement;
        var $extra = document.createElement("div");
        $extra.innerHTML = "/" + originalVal;
        $extra.style.fontWeight = "bold";
        $parent.appendChild($extra);

        if(originalVal > 10) {
            $input.value = 10;
        }
        $input.focus();
        var pos = $input.value.length;
        $input.setSelectionRange(pos, pos);
    },
    // Set the market search box to submit on Enter
    marketSubmit: function() {
        document.addEventListener("keyup", function(event) {
            if(event.keyCode == 13) {
                var elem = document.activeElement;
                if(elem.name == "ITEMQUERY" && elem.value != "") {
                    document.getElementsByName("ITEMSEARCH")[0].submit();
                }
            }
        });
    }
};

// -- Page Load Handler
var locStr = window.location.href;

if(locStr.match(/nbase\.php/)) {                    // Page: nbase.php
    Fixes.insertConfig();

    // The stuff below makes the map area look correct (if embedded chat is disabled)
    // Make it look correct initially
    if(GM_config.get('MoveMapUp') == true) {
        var $cont = document.getElementById("MAPGRID");
        $cont.style.top = "20px";
        $cont.style.height = (parseInt($cont.style.height, 10) + 20) + "px";

        function do_resize(recurse) {
            if (resizeTimeout != null) {
              clearTimeout(resizeTimeout);
              resizeTimeout=null;
            }

            var w = document.body.clientWidth;
            var h = document.body.clientHeight;

            document.getElementById('MENUFRAME').style.width = w-1;

            var div = document.getElementById('MAPGRID');

            if(window.frames['MAPGRID'].graphicGUI == true) {
                div.style.left = 0;
                div.style.width = w-2;
            } else {
                div.style.left = 185;
                div.style.width = w-203;
            }

            if(window.frames['MAPGRID'].graphicGUI == true) {
                div.style.height = h-(25+titleHeight);
            } else if(window.frames['MAPGRID'].fullscreen) {
                div.style.height = h-(52+titleHeight);
            } else {
                div.style.height = 680;
            }

            div.style.top = "20px";
            div.style.height = (parseInt(div.style.height, 10)+20) + "px";

            div = document.getElementById('MAINFRAME');
            div.style.height = h-22;
            div.style.width = w-1;

            if(recurse == null || recurse == undefined || recurse < 2) {
                if(recurse == null || recurse == undefined) {
                    recurse = 0;
                }
                resizeTimeout = setTimeout("do_resize("+(recurse+1)+");",500);
            }
        };

        Util.insertScript(do_resize.toString());
    }

} else if(locStr.match(/game\.php/)) {              // Page: game.php
    // TODO: Reloading the page actually changes the URL to just game.php with no query, this makes
    //       detection of location a tad more complicated. So... Do something about it.
    if(locStr.indexOf("SUBCOMBAT=TRUE") > -1) {
        if(GM_config.get('HorizontalCombat') == true) {
            Fixes.horizontalCombat();
        }

        if(GM_config.get('HotkeyCombat') == true) {
            function exec_key(key) {
                if ((key == kb.ENTER || key == kb.ESCAPE) && tostop) 
                {
                    window.top.closeSubPanel(true);
                    window.top.document.getElementById('MAINFRAME').src = endCombat;
                    return;
                }
                if (disablemove)
                    return;
                var keyHandled = false;
                if ((48 <= key && key <= 57) || (65 <= key && key <= 90))
                    keyHandled = execActionKey(String.fromCharCode(key));
                if (!keyHandled)
                    switch (key) 
                    {
                        case kb.ESCAPE:
                            flee();
                            return;
                        case kb.ENTER:
                        case kb.SPACE:
                            skipTurn();
                            return;
                        case kb.RIGHT:
                        case 0x44:
                        case 102:
                            cells[px][py] = 0;
                            dir = 'e';
                            if (px >= 9) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (havepet == true && px + 1 == pet_x && py == pet_y) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (px < 9 && cells[px + 1][py] > 0 && (ap > 2 || freeattack)) 
                            {
                                cells[px][py] = -1;
                                attack(cells[px + 1][py] - 1, px + 1, py);
                                return;
                            } 
                            else if (px < 9 && cells[px + 1][py] == 0 && ap > 0) 
                            {
                                ap--;
                                px++;
                            }
                            break;
                        case kb.LEFT:
                        case 0x41:
                        case 100:
                            dir = 'w';
                            cells[px][py] = 0;
                            if (px <= 0) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (havepet == true && px - 1 == pet_x && py == pet_y) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (px > 0 && cells[px - 1][py] > 0 && (ap > 2 || freeattack)) 
                            {
                                cells[px][py] = -1;
                                attack(cells[px - 1][py] - 1, px - 1, py);
                                return;
                            } 
                            else if (px > 0 && cells[px - 1][py] == 0 && ap > 0) 
                            {
                                ap--;
                                px--;
                                cells[px][py] = -1;
                            }
                            break;
                        case kb.UP:
                        case 0x57:
                        case 104:
                            dir = 'n';
                            cells[px][py] = 0;
                            if (py <= 0) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (havepet == true && px == pet_x && py - 1 == pet_y) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (py > 0 && cells[px][py - 1] > 0 && (ap > 2 || freeattack)) 
                            {
                                cells[px][py] = -1;
                                attack(cells[px][py - 1] - 1, px, py - 1);
                                return;
                            } 
                            else if (py > 0 && cells[px][py - 1] == 0 && ap > 0) 
                            {
                                ap--;
                                py--;
                                cells[px][py] = -1;
                            }
                            break;
                        case kb.DOWN:
                        case 0x58:
                        case 98:
                        case 83:
                            cells[px][py] = 0;
                            dir = 's';
                            if (py >= 6) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (havepet == true && px == pet_x && py + 1 == pet_y) 
                            {
                                cells[px][py] = -1;
                                return;
                            } 
                            else if (py < 6 && cells[px][py + 1] > 0 && (ap > 2 || freeattack)) 
                            {
                                cells[px][py] = -1;
                                attack(cells[px][py + 1] - 1, px, py + 1);
                                return;
                            } 
                            else if (py < 6 && cells[px][py + 1] == 0 && ap > 0) 
                            {
                                ap--;
                                py++;
                                cells[px][py] = -1;
                            }
                            break;
                        case kb.ONE:
                            execActionKey(1);
                            return;
                        case kb.TWO:
                            execActionKey(2);
                            return;
                        case kb.THREE:
                            execActionKey(3);
                            return;
                        case kb.FOUR:
                            execActionKey(4);
                            return;
                        case kb.FIVE:
                            execActionKey(5);
                            return;
                        case kb.SIX:
                            execActionKey(6);
                            return;
                        case kb.SEVEN:
                            execActionKey(7);
                            return;
                        case kb.EIGHT:
                            execActionKey(8);
                            return;
                        case kb.NINE:
                            execActionKey(9);
                            return;
                        case kb.ZERO:
                            execActionKey(0);
                            return;
                        default:
                    }
                cells[px][py] = -1;
                document.getElementById("AP_STAT").src = "images/ap_" + ap + ".gif";
                document.getElementById("PLAYER").style.left = px * 64;
                document.getElementById("PLAYER").style.top = py * 64;
                document.images["PLAYERICON"].src = 'players/' + prefix + iconid + '_' + dir + '.gif';
                checkCommands();
                if (ap <= 0 && freeattack == false && keyHandled == false) 
                {
                    disableCommands();
                    serverMessage("POS&PX=" + px + "&PY=" + py, continueAttack);
                }
            }
            Util.insertScript(exec_key.toString());
        }

        if(GM_config.get("FixCombatOverlay") == true) {
            var elem = $("#DIV_BGSUBFRAME", window.top.document);
            elem.css({
                "right": "0px",
                "bottom": "0px",
                "top": "20px",
                "width": "",
                "height": "" // These get overridden, but whatever
            });
        }

        if(GM_config.get("CombatDimBars") == true) {
            var css = "<style>" +
                "#combatBarContainer { transition: opacity 0.3s ease-in; color: black; height: 50px; width: 640px; position: absolute; top: 0px; left: 0px; }" +
                "#combatBarContainer:hover { opacity: 0.3; text-decoration: none; color: black; }" +
                "</style>";
            $("head").append(css);


            // Grab the divs that need to be moved into their own container
            var $hpBar = $("#DIV_LIFE");
            var $hpBarPart = $("#DIV_LIFE_OVER");
            var $hpBarText = $("#HPVIEW");
            var $mpBar = $("div > img[src='images/mp_empty.gif']").parent();
            var $mpBarPart = $("div > img[src='images/mp.gif']").parent();
            var $mpBarText = $("#MPVIEW");

            var $newSpan = $("<div id='combatBarContainer'></div>");
            var $containingElem = $("div > a > img[src='images/spacer.gif']").parent();
            // Quick hack to make underlines disappear for here:
            $containingElem.css("text-decoration", "none");
            $newSpan.appendTo($containingElem);

            $hpBar.appendTo($newSpan);
            $hpBarPart.appendTo($newSpan);
            $hpBarText.appendTo($newSpan);
            $mpBar.appendTo($newSpan);
            $mpBarPart.appendTo($newSpan);
            $mpBarText.appendTo($newSpan);
            // END TEST STUFF

            // Make sure the combat screen has focus
            var $tmp = $("img[src='images/spacer.gif']");
            $tmp.parent().focus();
        }

        if(GM_config.get("MovableCombat") == true) {
            var $grabBar = $("#MENU_DIV_SUBFRAME", window.top.document).closest("tr");
            var $moveElem = $("#DIV_SUBFRAME", window.top.document);
            var $tagAlong = $("#MENU_SUBFRAME", window.top.document);

            $grabBar.mousedown(function(event) {
                var mainPos = $moveElem.offset();
                var alsoPos = $tagAlong.offset();
                var offset = {
                    top: mainPos.top - event.pageY,
                    left: mainPos.left - event.pageX
                };
                var alsoOffset = {
                    top: alsoPos.top - event.pageY,
                    left: alsoPos.left - event.pageX
                };
                var $body = $('body', window.top.document);

                $body.mousemove(function(event) {
                    $moveElem.css({
                        top: event.pageY + offset.top,
                        left: event.pageX + offset.left
                    });
                    $tagAlong.css({
                        top: event.pageY + alsoOffset.top,
                        left: event.pageX + alsoOffset.left
                    });
                });

                $body.one('mouseup', function() {
                    $(this).off('mousemove');
                });

                event.preventDefault();
            });
        }

    } else if(locStr.indexOf("SHOPQUERY=") > -1 || locStr.indexOf("NEWLOC=23") > -1) { // Market Place
        Fixes.marketSubmit();
    } else if (locStr.indexOf("ACTION=JOURNAL") > -1) { // Journal
        if(GM_config.get("JournalDate") == true) {
            function redraw_journal() {
                quests.sort(function(a, b) {
                    var d1 = a.entries[a.entries.length-1].created.split("/");
                    var d2 = b.entries[b.entries.length-1].created.split("/");
                    var ad = d1[2] + "-" + d1[0] + "-" + d1[1];
                    var bd = d2[2] + "-" + d2[0] + "-" + d2[1];
                    if (ad > bd) {
                        return -1;
                    }
                    if (ad < bd) {
                        return 1;
                    }
                    return 0;
                });
                var entries = redraw_quests();
               redraw_entries(entries);
            }

            Util.insertScript(redraw_journal.toString() + "\nredraw_journal();");
        }
    } else if (locStr.indexOf("ADMIN=CHATLOGS") > -1) {
        // Constants
        var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
                      "October", "November", "December"];

        // Functions
        var newEntryObj = function(index, $anchor, list) {
            var name = $anchor.text().split(".")[0];
            if(index == 0) {
                var now = new Date();
                var nameParts = [ '', now.getFullYear(), now.getMonth()+1, now.getDate() ];
            } else {
                var nameParts = name.split("-");
            }

            var obj = {
                name: name,
                href: $anchor.prop("href"),
                list: list,
                year: parseInt(nameParts[1], 10),
                month: parseInt(nameParts[2], 10),
                day: parseInt(nameParts[3], 10)
            };
            return obj;
        };

        var buildList = function(list, $container) {
            var html = "";
            var len = list.length;
            var lastMonth = null;
            for(var i = 0; i < len; ++i) {
                var item = list[i];
                var date = new Date(item.year, item.month-1, item.day);

                // Month Divider
                if(lastMonth != item.month) {
                    if(lastMonth != null) {
                        html += "</ul>"
                    }
                    html += "<div class='chatLogDivider'>" + MONTHS[item.month-1] + " " + item.year + "</div><ul class='chatLogList'>";
                    lastMonth = item.month;
                }

                html += "<li class='chatLogEntry'>" +
                    "<a href='#' data-item-index='" + i + "' class='chatLogLink'>" +
                    DAYS[ date.getDay() ] + ", " + item.day + Util.intPostfix(item.day) + "</a></li>";
            }
            html += "</ul>";
            $container.append(html);
            $container.find("a.chatLogLink").each(function() {
                var $this = $(this);
                var index = $this.data("item-index");
                $this.click(function() {
                    var item = list[index];
                    setCurrentItem(item.list, index);
                    mainScrollLoc = $("#logContainer").scrollTop();
                    loadChatLog();
                });
            });
        };

        var getCurrentItem = function() {
            switch(currentItem.which) {
                case 'lodge':
                    return lodgeLogs[currentItem.index];
                case 'newbie':
                    return newbieLogs[currentItem.index];
                default:
                    alert("Error: Unknown log type '" + currentItem.which + "'!");
                    return '';
            }
        };

        var setCurrentItem = function(list, index) {
            currentItem.which = list;
            currentItem.index = index;
        };

        var setDirButtons = function() {
            var list;
            var index = currentItem.index;
            var $newer = $("#chatLogNewerButton");
            var $older = $("#chatLogOlderButton");
            switch(currentItem.which) {
                case 'lodge':
                    list = lodgeLogs;
                    break;
                case 'newbie':
                    list = newbieLogs;
                    break;
                default:
                    console.error("Unable to change directional buttons, unknown chat log list.");
                    return;
            }
            if(index >= list.length-1) {
                $older.html("Older &gt;")
                $older.prop("disabled", true);
            } else {
                var oldIndex = index+1;
                var oldItem = list[oldIndex];
                $older.prop("disabled", false);
                $older.html(oldItem.name + "&gt;");
                $older.off().on('click', function() {
                    setCurrentItem(oldItem.list, oldIndex);
                    loadChatLog();
                });
            }
            if(index < 1) {
                $newer.html("&lt; Newer");
                $newer.prop("disabled", "disabled");
            } else {
                var newIndex = index-1;
                var newItem = list[newIndex];
                $newer.prop("disabled", "");
                $newer.html("&lt; " + newItem.name);
                $newer.off().on('click', function() {
                    setCurrentItem(newItem.list, newIndex);
                    loadChatLog();
                });
            }
        };
        var loadChatLog = function() {
            var item = getCurrentItem();
            $.get(item.href, "", function(data) {
                var body = data.slice(data.indexOf("<body"), data.indexOf("</body>"));
                var body = body.slice(body.indexOf(">")+1);

                var $stuff = $.parseHTML(body);
                // Okay, this looks nasty so I'm going to explain:
                // $.parseHTML() returns an array, it just so happens that the content is actually the 3rd element in that array
                // From there we turn it into a jQuery object (because it's easier to find DOMy things) and search for the b with
                // the name of the chat log. Once we have that we move up the tree, over, and down into the chat log contents.
                //var $content = $($stuff[2]).find("b:contains(" + item.name + ".log)").closest("tr").next().children().contents();
                // NOTE: CHRISTMAS
                var $content = $($stuff[2]).find("b:contains(" + item.name + ".log)").closest("table").find("div").first().contents();

                var $container = $("#logContent");
                $container.empty().append($content);

                // Hide the selection interface and show the (newly constructed)
                $("#logTable").hide();
                $("#chatLogTitle").html(item.name);
                $container.show();
                $("#chatLogBackButton").show();

                setDirButtons();
                $("#chatLogDirButton").show();
            }, 'text');
        };

        // Inject CSS
        var css = "<style>" +
            "#chatContainerHeader { background-color: black; color: white; font-weight: bold; text-align: center; height: 2.2em; font-size: 1em; }" +
            "#chatLogBackButton { display: none; float: left; }" +
            "#chatLogDirButton { display: none; float: right; }" +
            "#chatLogTitle {}" +
            ".chatLogHeader { background-color: black; color: white; font-weight: bold; line-height: 1.8em; text-align: center; }" +
            ".chatLogColumn { vertical-align: top; }" +
            ".chatLogDivider { background-color: black; color:white; font-weight: bold; line-height: 1.5em; padding-left: 0.3em; }" +
            ".chatLogList { padding: 0; margin: 0; list-style: none; }" +
            ".chatLogEntry { line-height: 1.3em; }" +
            ".chatLogEntry:nth-child(even) { background-color: #EEEEEE; }" +
            ".chatLogLink { display: block; transition: padding-left 0.3s; }" +
            ".chatLogLink:hover { background-color: #BBBBBB !important; text-decoration: none; }" +
            "</style>";
        $("head").append(css);

        // Variables
        var lodgeLogs = [];
        var newbieLogs = [];
        var currentItem = { which: 'lodge', index: 0 };
        var mainScrollLoc;

        var $header = $("body b:contains(Available logs)").parent().parent();
        // NOTE: CHIRSTMAS
        //var $container = $header.parent().next().children().contents();
        var $container = $("body b:contains(Lodge:)").closest("div");
        $container.attr("id", "logContainer");

        var $lodgeLi = $container.find("table:nth-child(1) > tbody:nth-child(1) > " +
                     "tr:nth-child(2) > td:nth-child(1) li");
        var $newbieLi = $container.find("table:nth-child(1) > tbody:nth-child(1) > " +
                     "tr:nth-child(2) > td:nth-child(2) li");

        // Clear the container and start making changes to the header
        $container.empty();
        $header.empty().attr("id", "chatContainerHeader").html("<span id='chatLogBackButton'><button>&lt;Logs</button></span>" +
                                                               "<span id='chatLogTitle'>Available Logs</span>" +
                                                               "<span id='chatLogDirButton'><button id='chatLogNewerButton'>&lt; Newer</button><button id='chatLogOlderButton'>Older &lt;</button></span>");
        $('#chatLogBackButton > button').click(function() {
            $("#logContent").hide();
            $("#logTable").show();
            $("#logContainer").scrollTop(mainScrollLoc);
            $("#chatLogBackButton").hide();
            $("#chatLogDirButton").hide();
            $("#chatLogTitle").html("Available Logs");
            return false;
        });

        // Populate the arrays
        $lodgeLi.filter("li").each(function(index) {
            var $anchor = $(this).find("a");
            // This fixes a really stupid rendering bug. The output actually has THREE links to the
            // current chat. On in the first li, one between the first and second li and one in the
            // second li. Stupid. Just. Plain. Stupid.
            if(index == 1) {
                $anchor = $(this).find("a:nth-child(2)");
            }
            lodgeLogs.push(newEntryObj(index, $anchor, 'lodge'));
        });
        $newbieLi.filter("li").each(function(index) {
            var $anchor = $(this).find("a");
            if(index == 1) {
                $anchor = $(this).find("a:nth-child(2)");
            }
            newbieLogs.push(newEntryObj(index, $anchor, 'newbie'));
        });

        // Build the new lists and show it
        var str = "<table id='logTable' border='0' style='width: 100%;' cellpadding='0'>" +
            "<tr><td class='chatLogHeader'>Lodge</td><td class='chatLogHeader'>Newbie</td></tr>" +
            "<tr><td class='chatLogColumn'></td>" +
            "<td class='chatLogColumn'></td></tr>" +
            "</table>" +
            "<div id='logContent' style='display: none; background-color: white;'></div>";
        html = $(str);
        buildList(lodgeLogs, html.find(".chatLogColumn:first"));
        buildList(newbieLogs, html.find(".chatLogColumn:nth-child(2)"));
        $container.append(html);
    } else {
        console.log(locStr);
    }
} else if(locStr.match(/mapgrid\.php/)) {           // Page: mapgrid.php
    if(GM_config.get('MoveMapMessages')) {
        Fixes.mapMoveMessageBox();
    }
} else if(locStr.match(/statue\_scrubbing\.php/)) {
    var $input = document.getElementsByName('SOAP_WATER')[0];
    Fixes.resetStatueBoxes($input);
} else if(locStr.match(/player\_info\.php/)) {
    var toRemoveFirst = ["Ban"];
    var toRemoveSecond = ["Trade"];
    var l = toRemoveFirst.length;
    var $tbl = $("table:eq(0)");
    for(var i=0; i<l; i++) {
        $tbl.find("img[src='player_info.php?IMG=" + toRemoveFirst[i] + "']").parent().parent().remove();
    }
    l = toRemoveSecond.length;
    $tbl = $("table:eq(1)");
    for(var i=0; i<l; i++) {
        $tbl.find("img[src='player_info.php?IMG=" + toRemoveSecond[i] + "']").parent().parent().remove();
    }
} else {
    alert(window.location.href);
}