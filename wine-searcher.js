function wowserRecommendations(c) {
    var b = Math.min($(window).width(), $("#recommendationContainer").width());
    var a = Math.floor(b / 135);
    if (a == 1) {
        a = 3
    }
    $.ajax({
        type: "GET",
        url: c,
        data: {
            numberNeeded: a
        },
        dataType: "HTML",
        success: function(f, d, g) {
            $("#recommendationContainer").html('<b style="padding-left:7px">Recent Stories</b><div style="height:10px">&nbsp;</div>' + f)
        },
        error: function() {
            $("#recommendationContainer").html("")
        }
    });
    $(window).resize(function() {
        var f = Math.min($(window).width(), $("#recommendationContainer").width());
        var d = Math.floor(f / 135);
        if (d == 1) {
            d = 3
        }
        for (var g = 3; g < 13; g++) {
            if (d < g) {
                $("#panel_" + g).hide()
            } else {
                $("#panel_" + g).show()
            }
        }
    })
}

function drawTrueBottleChart() {
    if ($("#tb_chart").length) {
        $.ajax({
            dataType: "jsonp",
            contentType: "application/json",
            url: "https://truebottle.com/json/",
            data: {
                vintage: truebottle_vintage,
                name: truebottle_name
            },
            success: function(chartData, status, obj) {
                if (chartData.TRUEBOTTLE_UNIQUE_ID == 0) {} else {
                    var mths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    var lastTime = 0;
                    var lastVal = 0;
                    var pointCtr = 0;
                    var comma = "";
                    var dString1 = "[";
                    for (var i = 0; i < chartData.X_AXIS_AUCTION_DATE_IN_UNIXTIME.length; i++) {
                        var thisTime = chartData.X_AXIS_AUCTION_DATE_IN_UNIXTIME[i];
                        var thisVal = chartData.Y_AXIS_AUCTION_PRICE_IN_USD[i];
                        if (thisTime != lastTime || thisVal != lastVal) {
                            pointCtr = pointCtr + 1
                        }
                        lastTime = thisTime;
                        lastVal = thisVal;
                        dString1 = dString1.concat(comma, "[", thisTime * 1000, ",", thisVal, "]");
                        comma = ","
                    }
                    dString1 = dString1.concat("]");
                    dString1 = eval(dString1);
                    if (pointCtr == 1) {
                        var dt = new Date(chartData.X_AXIS_AUCTION_DATE_IN_UNIXTIME[0] * 1000);
                        var d = dt.getDate();
                        var m = mths[dt.getMonth()];
                        var y = dt.getFullYear();
                        var s1 = '<h3 style="text-align: center;">One Auction Result found: ' + d + " " + m + " " + y + " Price: USD $" + chartData.Y_AXIS_AUCTION_PRICE_IN_USD[0] + "</h3>";
                        $("#tb_chart").html(s1)
                    }
                    if (pointCtr > 1) {
                        comma = "";
                        var dString2 = "[";
                        var chartHdr = "USD $";
                        var nd;
                        for (var i = 0; i < chartData.X_AXIS_REGRESSION_ANALYSIS_IN_UNIXTIME.length; i++) {
                            if (i == 0 || i == chartData.X_AXIS_REGRESSION_ANALYSIS_IN_UNIXTIME.length - 1) {
                                dString2 = dString2.concat(comma, "[", chartData.X_AXIS_REGRESSION_ANALYSIS_IN_UNIXTIME[i] * 1000, ",", chartData.Y_AXIS_REGRESSION_ANALYSIS_IN_USD[i], "]");
                                comma = ","
                            }
                            if (i == 0) {
                                nd = new Date(chartData.X_AXIS_REGRESSION_ANALYSIS_IN_UNIXTIME[i] * 1000);
                                chartHdr = chartHdr + ", " + mths[nd.getMonth()] + " " + nd.getFullYear()
                            }
                            if (i == chartData.X_AXIS_REGRESSION_ANALYSIS_IN_UNIXTIME.length - 1) {
                                nd = new Date(chartData.X_AXIS_REGRESSION_ANALYSIS_IN_UNIXTIME[i] * 1000);
                                chartHdr = chartHdr + " to " + mths[nd.getMonth()] + " " + nd.getFullYear()
                            }
                        }
                        dString2 = dString2.concat("]");
                        dString2 = eval(dString2);
                        $(function() {
                            var e = new Highcharts.Chart({
                                chart: {
                                    renderTo: "tb_chart",
                                    height: 350,
                                    type: "line",
                                    zoomType: "xy",
                                    events: {
                                        load: function() {
                                            document.getElementById("auctionChartContent").style.display = "block";
                                            this.reflow();
                                            setChartYMin(this)
                                        }
                                    }
                                },
                                credits: {
                                    enabled: false
                                },
                                title: {
                                    text: "Auction Price History",
                                    margin: 20,
                                    y: 15,
                                    style: {
                                        color: "#fff"
                                    }
                                },
                                subtitle: {
                                    text: " "
                                },
                                xAxis: {
                                    type: "datetime",
                                    labels: {
                                        rotation: 0,
                                        y: 20,
                                        align: "left",
                                        formatter: function() {
                                            return Highcharts.dateFormat("%Y", this.value) + "<br/>" + Highcharts.dateFormat("%d %b", this.value)
                                        }
                                    },
                                    title: {
                                        text: ""
                                    }
                                },
                                yAxis: {
                                    allowDecimals: false,
                                    labels: {
                                        formatter: function() {
                                            return "$" + Highcharts.numberFormat(this.value, 0, ",")
                                        }
                                    },
                                    title: {
                                        text: "Price",
                                        align: "high",
                                        offset: 10,
                                        style: {
                                            color: "#000",
                                            fontSize: "1em",
                                            fontFamily: "Verdana, Arial, Helvetica, sans-serif"
                                        },
                                        rotation: 0,
                                        y: -20
                                    }
                                },
                                tooltip: {
                                    formatter: function() {
                                        return "<b>" + Highcharts.dateFormat("%e %b %Y", this.x) + "</b><br>" + this.series.name + " <b>" + Highcharts.numberFormat(this.y, 0, ",") + "</b>"
                                    }
                                },
                                series: [{
                                    name: "Auction Price, ex tax, including buyer's premium",
                                    type: "line",
                                    animation: false,
                                    data: dString1,
                                    color: "#fc7d19",
                                    showInLegend: false
                                }, {
                                    name: "Auction Price Trend",
                                    type: "line",
                                    animation: false,
                                    color: "#b0b0b0",
                                    data: dString2,
                                    showInLegend: false
                                }]
                            })
                        })
                    }
                    if (pointCtr > 0) {
                        $("#auctionChartContent").removeClass("hide").addClass("show");
                        $(".tb_link_a").attr("href", "https://www.truebottle.com/index.html?action=search&id=" + chartData.TRUEBOTTLE_UNIQUE_ID + "&vintage=" + truebottle_vintage)
                    }
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {}
        })
    } else {}
}

function button_click() {
    if (processing == 1) {
        return false
    } else {
        processing = 1;
        return true
    }
}

function search_button_click() {
    if (processing == 1) {
        return false
    } else {
        var b = new pageLoader($("body"), {
            bgColor: "#D2D2D2"
        });
        processing = 1;
        if (!flds_tidy) {
            tidySchFlds()
        }
        var a = constructFind();
        window.location.href = a;
        return false
    }
}

function goSubmit() {
    if (!flds_tidy) {
        tidySchFlds()
    }
}

function tidySchFlds() {
    var b = false;
    var a = new Array("wine name", "nom du vin", "nome del vino", "name des weins", "nombre del vino");
    b = a.toString().indexOf($("#Xwinename").val().toLowerCase()) > -1;
    if (b) {
        $("#Xwinename").val("")
    }
    b = false;
    var a = new Array("vintage", "vint", "annï¿½e", "annata", "jahr", "cosecha");
    b = a.toString().indexOf($("#Xvintage").val().toLowerCase()) > -1;
    if (b) {
        $("#Xvintage").val("")
    }
    if (typeof($("#Xprice_min").val()) != "undefined") {
        if ($("#Xprice_min").val().toString().toLowerCase() == "min") {
            $("#Xprice_min").val("")
        }
        if ($("#Xprice_max").val().toString().toLowerCase() == "max") {
            $("#Xprice_max").val("")
        }
        if ($("#Xprice_min").val() != "" && $("#Xprice_max").val() != "" && $("#Xprice_min").val() != "Min" && $("#Xprice_max").val() != "Max") {
            if (parseInt($("#Xprice_min").val()) > parseInt($("#Xprice_max").val())) {
                var c = $("#Xprice_min").val();
                $("#Xprice_min").val($("#Xprice_max").val());
                $("#Xprice_max").val(c)
            }
        }
    }
    flds_tidy = true
}

function show_shipto() {
    styleObj = document.getElementById("Xshiptoid").style;
    if (document.searchform.Xlocation.value == "USA" && document.searchform.Xstate.value != "" && document.searchform.Xstate.value != "ANY" && document.searchform.Xstate.value != "R." && document.searchform.Xstate.value != "ZC") {
        styleObj.display = ""
    } else {
        styleObj.display = "none"
    }
    if (document.searchform.Xlocation.value == "USA" && document.searchform.Xstate.value == "ZC") {
        show_zip()
    } else {
        hide_zip()
    }
    if (document.searchform.Xstate.value != "" && document.searchform.Xstate.value != "ANY" && document.searchform.Xstate.value != "ZC") {
        document.searchform.Xzipcode.value = "";
        $("#Xzipcode__clear").css("visibility", "hidden");
        $(".formplaceholder").addPlaceholder()
    }
}

function show_zip_new() {
    styleObj = document.getElementById("XzipDiv").style;
    if (document.searchform.Xlocation.value == "USA") {
        styleObj.display = ""
    } else {
        styleObj.display = "none"
    }
}

function show_states_new() {
    styleObj = document.getElementById("USAstatezip").style;
    if (document.searchform.Xlocation.value == "USA") {
        styleObj.display = ""
    } else {
        styleObj.display = "none"
    }
    show_shipto();
    show_zip_new()
}

function show_zip() {
    styleObj = document.getElementById("Xziplabelid").style;
    styleObj.display = "inline-block";
    styleObj = document.getElementById("Xzipdetailid").style;
    styleObj.display = "inline-block";
    $(".formplaceholder").addPlaceholder()
}

function hide_zip() {
    styleObj = document.getElementById("Xziplabelid").style;
    styleObj.display = "none";
    styleObj = document.getElementById("Xzipdetailid").style;
    styleObj.display = "none";
    document.searchform.Xzipcode.value = ""
}

function show_states() {
    styleObj = document.getElementById("Xstateid").style;
    if (document.searchform.Xlocation.value == "USA") {
        styleObj.display = ""
    } else {
        styleObj.display = "none"
    }
    show_shipto()
}

function reset_fld(b) {
    var a = document.getElementById(b);
    a.className = a.className.replace("inputdefault", "");
    if (a.value == "email@example.com" || a.value == "password") {
        a.value = ""
    }
}

function resetFldDefault(a) {
    $("#" + a.replace("__clear", "")).val("");
    if ((a.replace("__clear", "") == "Xwinename") || (a.replace("__clear", "") == "Xsearchregion") || (a.replace("__clear", "") == "Xsearchgrape") || (a.replace("__clear", "") == "Xsearchmerchant") || (a.replace("__clear", "") == "Xsearcharticle")) {
        $(".typeahead").typeahead("val", "")
    }
    $("#" + a.replace("__clear", "")).focus()
}

function SortWineList(d, b, f, c, a) {
    if (d == "award") {
        ajax_sort_url = "/ajax/ajax-wine-list.lml?Xaward_id=" + b
    } else {
        if (d == "critic") {
            ajax_sort_url = "/ajax/ajax-wine-list.lml?Xcritic_id=" + b
        } else {
            if (d == "grape") {
                ajax_sort_url = "/ajax/ajax-wine-list.lml?Xgrape_id=" + b
            } else {
                if (d == "producer") {
                    ajax_sort_url = "/ajax/ajax-wine-list.lml?Xproducer_id=" + b
                } else {
                    if (d == "food") {
                        ajax_sort_url = "/ajax/ajax-wine-list.lml?Xfoodcategory_id=" + b
                    } else {
                        if (d == "region") {
                            ajax_sort_url = "/ajax/ajax-wine-list.lml?Xregion_id=" + b
                        } else {
                            if (d == "wine") {
                                ajax_sort_url = "/ajax/ajax-wine-list.lml?Xwine_terms=" + b
                            }
                        }
                    }
                }
            }
        }
    }
    ajax_sort_url = ajax_sort_url + "&Xsort_flag=" + f + "&Xsort_ad=" + c + "&first_wine=" + a;
    $.ajax({
        url: ajax_sort_url,
        beforeSend: function() {
            $("#winesortlist").css({
                opacity: 0.5
            });
            $("#winesortlist").css({
                backgroundImage: "url(/images/ajax-loader.gif)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            })
        },
        success: function(h, g) {
            var j = $(document).attr("title");
            if (j.indexOf("- page ") > 0) {
                j = j.replace(/- page [0-9]+ of [0-9]+/g, "");
                $(document).attr("title", j)
            }
            $(".pgno").css("display", "none");
            $("#winesortlist").css({
                backgroundImage: "none"
            });
            $("#winesortlist").css({
                opacity: 1
            });
            $("#winesortlist").hide().html(h).fadeIn(1000);
            loadSortHandlers()
        },
        error: function() {
            $("#winesortlist").css({
                backgroundImage: "none"
            });
            $("#winesortlist").css({
                opacity: 1,
                top: $("#winesortlist").offset().top,
                width: $("#winesortlist").outerWidth(),
                height: $("#winesortlist").outerHeight()
            });
            $("#winesortlist").html('Unknown return code, please contact <A HREF="mailto:feedback@wine-searcher.com?subject=Error in Search">Wine-Searcher</A> and tell us the wine you were looking for.')
        }
    })
}

function loadSortHandlers() {
    $(".col_sortable").click(function() {
        var g = this.className;
        var k = /SORT.*?\.WS/g;
        var d = g.match(k);
        var b;
        var f;
        var l;
        var c;
        var j = "A";
        var h = 1;
        k = /-.*?\.WS/g;
        $.each(d, function(a, m) {
            b = null;
            if (m.indexOf("SORTTYPE") != -1) {
                b = m.match(k);
                f = b[0].substring(1, b[0].lastIndexOf(".WS"))
            }
            if (m.indexOf("SORTID") != -1) {
                b = m.match(k);
                l = b[0].substring(1, b[0].lastIndexOf(".WS"))
            }
            if (m.indexOf("SORTFLAG") != -1) {
                b = m.match(k);
                c = b[0].substring(1, b[0].lastIndexOf(".WS"))
            }
            if (m.indexOf("SORTAD") != -1) {
                b = m.match(k);
                j = b[0].substring(1, b[0].lastIndexOf(".WS"))
            }
            if (m.indexOf("SORTFIRSTWINE") != -1) {
                b = m.match(k);
                h = b[0].substring(1, b[0].lastIndexOf(".WS"))
            }
        });
        if (f != "" && l != "" && c != "") {
            SortWineList(f, l, c, j, h)
        }
        return false
    });
    $(".sort_title_link").click(function(a) {
        a.stopPropagation()
    })
}

function drawChart() {
    var a = new Highcharts.Chart({
        chart: {
            renderTo: "hst_price_div"
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false
                }
            },
            series: {
                animation: false,
                shadow: false
            }
        },
        point: {
            marker: {
                enabled: false
            }
        },
        tooltip: {
            enabled: false
        },
        title: {
            text: ""
        },
        xAxis: {
            type: "datetime",
            labels: {
                enabled: false
            }
        },
        yAxis: {
            title: ""
        },
        series: [{
            data: arrChart
        }]
    })
}

function setChartYMin(c) {
    if ("yAxis" in c) {
        var b = c
    } else {
        var b = this
    }
    var a = b.yAxis[0].getExtremes();
    if (a.min < 0) {
        b.yAxis[0].setExtremes(0, null, true, false)
    }
}

function drawFullChart(f, b, g) {
    var d = true;
    var a = true;
    var c = new Highcharts.Chart({
        chart: {
            renderTo: f,
            height: g,
            zoomType: "xy",
            events: {
                load: function() {
                    setChartYMin(this)
                }
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                animation: false
            }
        },
        title: {
            text: "Price Histroy",
            margin: 20,
            y: 15,
            style: {
                color: "#fff"
            }
        },
        subtitle: {
            text: ""
        },
        xAxis: {
            dateTimeLabelFormats: {
                month: "%Y-%m"
            },
            labels: {
                rotation: 0,
                y: 20,
                align: "right",
                formatter: function() {
                    return Highcharts.dateFormat("%Y", this.value) + "<br/>" + Highcharts.dateFormat("%d %b", this.value)
                }
            },
            type: "datetime"
        },
        yAxis: {
            allowDecimals: false,
            labels: {
                formatter: function() {
                    return curSymbol + Highcharts.numberFormat(this.value, 0, ",")
                }
            },
            title: {
                text: "Price",
                align: "high",
                offset: 10,
                style: {
                    color: "#000",
                    fontSize: "1em",
                    fontFamily: "Verdana, Arial, Helvetica, sans-serif"
                },
                rotation: 0,
                y: -20
            },
            type: arrChartType,
            tickInterval: (arrChartType == "line" ? null : 0.4),
            minorTickInterval: (arrChartType == "line" ? null : 0.1)
        },
        tooltip: {
            formatter: function() {
                return "<b>" + Highcharts.dateFormat("%b-%Y", this.x) + "</b><br>" + (this.series.name == "Benchmark" ? "benchmark price " : "average price ") + "<b>" + curSymbol + Highcharts.numberFormat(this.y, 0, ",") + "</b>"
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: "Avg Retail Price " + hstLoct + "(per 750ml, ex tax " + curCode + "" + curSymbol + ")",
            events: {
                legendItemClick: function(h) {
                    return false
                }
            },
            data: arrChart,
            color: "#0b7222",
            showInLegend: false
        }, {
            name: 'Benchmark <img class="chartBenchmarkHelp ico_info_charts" id="phbh" src="/images/pixel.gif">',
            data: arrChartRgnGrp,
            visible: (arrChartRgnGrp.length > 0),
            showInLegend: (arrChartRgnGrp.length > 0),
            color: "#b0b0b0",
            showInLegend: false
        }]
    })
}

function resetDetailPriceChartDimensions() {
    drawFullChart("hst_price_div_detail_page", true, prcHistChartHeight)
}
var checkBoxBorder = false;
var checkBoxBorder2 = false;

function initMap() {
    DrawMap();
    checkBoxBorder = true;
    ShowBoxBorder()
}
if (typeof doChart != "undefined") {
    if (doChart) {
        drawPiechart();
        checkBoxBorder = true
    }
}
if (typeof doChart2 != "undefined") {
    if (doChart2) {
        drawPiechart2();
        checkBoxBorder2 = true
    }
}
if (checkBoxBorder) {
    ShowBoxBorder()
}
if (checkBoxBorder2) {
    ShowBoxBorder()
}
if (typeof drawAvailabilityChart == "undefined") {
    drawAvailabilityChart = false
}
if (typeof drawAvailabilityChartHeight == "undefined") {
    drawAvailabilityChartHeight = 300
}
if (drawAvailabilityChart) {
    try {
        drawAvailabilityChartNow("avail_div_detail_page", true, drawAvailabilityChartHeight)
    } catch (e) {}
}

function drawAvailabilityChartNow(f, b, g) {
    var d = true;
    var a = true;
    var c = new Highcharts.Chart({
        chart: {
            renderTo: f,
            height: g,
            zoomType: "xy",
            events: {
                load: function() {
                    document.getElementById("availabilityChartContent").style.display = "block";
                    this.reflow();
                    setChartYMin(this)
                }
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                animation: false
            }
        },
        title: {
            text: "Availability History Chart",
            margin: 20,
            y: 15,
            style: {
                color: "#fff"
            }
        },
        subtitle: {
            text: " "
        },
        xAxis: {
            dateTimeLabelFormats: {
                month: "%Y-%m"
            },
            labels: {
                rotation: 0,
                y: 20,
                align: "right",
                formatter: function() {
                    return Highcharts.dateFormat("%Y", this.value) + "<br/>" + Highcharts.dateFormat("%d %b", this.value)
                }
            },
            type: "datetime"
        },
        yAxis: {
            allowDecimals: false,
            labels: {
                formatter: function() {
                    return Highcharts.numberFormat(this.value, 0, ",")
                }
            },
            title: {
                text: "Offers",
                align: "high",
                offset: 10,
                style: {
                    color: "#000",
                    fontSize: "1em",
                    fontFamily: "Verdana, Arial, Helvetica, sans-serif"
                },
                rotation: 0,
                y: -20
            },
            type: availChartType,
            tickInterval: (availChartType == "line" ? null : 0.4),
            minorTickInterval: (availChartType == "line" ? null : 0.1)
        },
        tooltip: {
            formatter: function() {
                return "<b>" + Highcharts.dateFormat("%b-%Y", this.x) + "</b><br>" + (this.series.name == "Benchmark" ? "benchmark availability " : "average availability ") + " <b>" + Highcharts.numberFormat(this.y, 0, ",") + "</b>"
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: "Based on Number of Offers/Suppliers",
            events: {
                legendItemClick: function(h) {
                    return false
                }
            },
            data: availChart,
            color: "#b3cb05",
            showInLegend: false
        }, {
            name: 'Benchmark <img class="chartBenchmarkHelp ico_info_charts" id="ahbh" src="/images/pixel.gif">',
            data: availChartRgnGrp,
            visible: (availChartRgnGrp.length > 0),
            showInLegend: false,
            color: "#b0b0b0"
        }]
    })
}
if (typeof drawDemandChart == "undefined") {
    drawDemandChart = false
}
if (typeof drawDemandChartHeight == "undefined") {
    drawDemandChartHeight = 300
}
if (drawDemandChart) {
    try {
        drawDemandChartNow("demand_div_detail_page", true, drawDemandChartHeight)
    } catch (e) {}
}

function drawDemandChartNow(f, b, g) {
    var d = true;
    var a = true;
    var c = new Highcharts.Chart({
        chart: {
            renderTo: f,
            height: g,
            zoomType: "xy",
            events: {
                load: function() {
                    var j = this;
                    var h = j.legend;
                    setChartYMin(this);
                    document.getElementById("demandChartContent").style.display = "block";
                    j.reflow()
                }
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                animation: false
            }
        },
        title: {
            text: "Search Rank History Chart",
            margin: 20,
            y: 15,
            style: {
                color: "#fff"
            }
        },
        subtitle: {
            text: " "
        },
        xAxis: {
            dateTimeLabelFormats: {
                month: "%Y-%m"
            },
            labels: {
                rotation: 0,
                y: 20,
                align: "right",
                formatter: function() {
                    return Highcharts.dateFormat("%Y", this.value) + "<br/>" + Highcharts.dateFormat("%d %b", this.value)
                }
            },
            type: "datetime",
            reversed: false
        },
        yAxis: {
            allowDecimals: false,
            labels: {
                formatter: function() {
                    if (demandChartType == "line" && this.value == 0) {
                        return 1
                    }
                    return Highcharts.numberFormat(this.value, 0, ",")
                }
            },
            title: {
                text: "Rank",
                align: "high",
                offset: 10,
                style: {
                    color: "#000",
                    fontSize: "1em",
                    fontFamily: "Verdana, Arial, Helvetica, sans-serif"
                },
                rotation: 0,
                y: -20
            },
            reversed: true,
            type: demandChartType,
            min: (demandChartMin > 20 ? null : 1),
            minorTickInterval: (demandChartType == "line" ? null : 0.1),
            tickInterval: (demandChartType == "line" ? null : 0.4)
        },
        tooltip: {
            formatter: function() {
                return "<b>" + Highcharts.dateFormat("%b-%Y", this.x) + "</b><br>" + (this.series.name == "Benchmark" ? "benchmark search rank " : "search rank ") + " <b>" + Highcharts.numberFormat(this.y, 0, ",") + "</b>"
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: "Based on Frequency of Searches",
            events: {
                legendItemClick: function(h) {
                    window.location.href = "/wine-rank.lml";
                    return false
                }
            },
            data: demandChart,
            color: "#cbb505",
            showInLegend: false
        }]
    })
}
var directionsService = null,
    directionsDisplay = null;
var latlng_start = null,
    latlng_end = null;

function DrawMap() {
    var k = 5;
    var l = mapRegionLevel;
    var c = mapStrRegion;
    var a = mapRestOfWorld;
    var g;
    if (typeof mapType != "undefined") {
        if (mapType != "") {
            g = mapType
        }
    }
    c = c.replace("orthern", "orth").replace("outhern", "outh").replace("estern", "est").replace("astern", "ast");
    if (mapStrCurrRegionEsc != "") {
        if (mapRegion_zoom_d != "") {
            k = mapRegion_zoom_d
        } else {
            if (l == 1) {
                k = 3
            } else {
                if (l == 2) {
                    if (a == "1") {
                        k = 4
                    } else {
                        k = 3
                    }
                } else {
                    if (l == 3) {
                        if (a == "1") {
                            k = 5
                        } else {
                            k = 4
                        }
                    } else {
                        if (l > 3) {
                            if (a == "1") {
                                k = 6
                            } else {
                                k = 5
                            }
                        }
                    }
                }
            }
        }
        if (mapRegion_latitude_d != "" && mapRegion_longitude_d != "") {
            document.getElementById("mapHeader").style.display = "block";
            document.getElementById("map_div").style.display = "block";
            if (mapRegion_show_satelite_d == "Y") {
                g = "HYBRID"
            } else {
                g = "TERRAIN"
            }
            var b = new google.maps.Map(document.getElementById("map_div"), {
                center: {
                    lat: mapRegion_latitude_d,
                    lng: mapRegion_longitude_d
                },
                mapTypeId: google.maps.MapTypeId[g],
                zoom: k
            });
            google.maps.event.trigger(b, "resize");
            var h = new google.maps.Marker({
                map: b,
                position: {
                    lat: mapRegion_latitude_d,
                    lng: mapRegion_longitude_d
                }
            });
            var f = new google.maps.InfoWindow();

            function j(o, n) {
                var p = "";
                if (n) {
                    p = o[0]
                } else {
                    p = '<div id="infowindow"><a href="' + location.protocol + "//" + location.hostname + "/regions-" + o[0].toLowerCase().replace(/\s+/gi, "+") + '">' + o[0] + "</a></div>"
                }
                var m = new google.maps.Marker({
                    position: {
                        lat: o[1],
                        lng: o[2]
                    },
                    map: b
                });
                google.maps.event.addListener(m, "click", function() {
                    f.close();
                    f.setContent(p);
                    f.open(b, m)
                })
            }
            var d = [
                [mapRegion_regionname_d, mapRegion_latitude_d, mapRegion_longitude_d]
            ];
            if (mapRegion_subregions_d.length > 0) {
                var d = d.concat(mapRegion_subregions_d)
            }
            for (var g = 0; g < d.length; g++) {
                if (g == 0) {
                    j(d[g], true)
                } else {
                    j(d[g], false)
                }
            }
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer();
            if (typeof show_direction !== "undefined") {
                if (show_direction == "Y") {
                    directionsDisplay.setMap(b);
                    latlng_start = new google.maps.LatLng(user_geo_lat, user_geo_lng);
                    latlng_end = new google.maps.LatLng(mapRegion_latitude_d, mapRegion_longitude_d);
                    calcRoute(b, h, latlng_start, latlng_end)
                } else {
                    showMapAddress(b, h, mapRegion_latitude_d, mapRegion_longitude_d, "", "")
                }
            }
        } else {
            if (g == "") {
                g = "TERRAIN"
            }
            geocoder = new google.maps.Geocoder;
            geocoder.geocode({
                address: unescape(c).replace(/[+]/gi, " ")
            }, function(o, q) {
                if (q == google.maps.GeocoderStatus.OK) {
                    document.getElementById("mapHeader").style.display = "block";
                    document.getElementById("map_div").style.display = "block";
                    var p = new google.maps.Map(document.getElementById("map_div"), {
                        center: {
                            lat: o[0].geometry.location.lat(),
                            lng: o[0].geometry.location.lng()
                        },
                        mapTypeId: google.maps.MapTypeId[g],
                        zoom: k
                    });
                    google.maps.event.trigger(p, "resize");
                    var m = new google.maps.Marker({
                        map: p,
                        position: {
                            lat: o[0].geometry.location.lat(),
                            lng: o[0].geometry.location.lng()
                        }
                    });
                    directionsService = new google.maps.DirectionsService();
                    directionsDisplay = new google.maps.DirectionsRenderer();
                    if (typeof show_direction !== "undefined") {
                        if (show_direction == "Y") {
                            directionsDisplay.setMap(p);
                            latlng_start = new google.maps.LatLng(user_geo_lat, user_geo_lng);
                            latlng_end = new google.maps.LatLng(o[0].geometry.location.lat(), o[0].geometry.location.lng());
                            calcRoute(p, m, latlng_start, latlng_end)
                        } else {
                            showMapAddress(p, m, o[0].geometry.location.lat(), o[0].geometry.location.lng(), "", "")
                        }
                    }
                } else {
                    $("#map_container").css("display", "none");
                    if (typeof doChart != "undefined") {
                        if (!doChart) {
                            $("#chartcontainer").css("display", "none")
                        }
                    }
                }
            })
        }
    }
}

function reCalcRoute() {
    calcRoute(null, null, latlng_start, latlng_end)
}

function calcRoute(f, a, d, b) {
    var g = document.getElementById("travel_mode").value;
    var c = {
        origin: d,
        destination: b,
        travelMode: google.maps.TravelMode[g]
    };
    directionsService.route(c, function(j, h) {
        if (h == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(j);
            if (f != null && a != null) {
                showMapAddress(f, a, "", "", b, "")
            }
        } else {
            if (h == google.maps.DirectionsStatus.ZERO_RESULTS) {
                if (f != null && a != null) {
                    showMapAddress(f, a, "", "", b, "(Sorry, we canï¿½t calculate directions)")
                }
            } else {
                if (f != null && a != null) {
                    showMapAddress(f, a, "", "", b, "(Sorry, we canï¿½t calculate directions)")
                }
            }
        }
    })
}

function showMapAddress(f, b, c, a, h, g) {
    if (typeof mapAddress !== "undefined") {
        if (mapAddress != "") {
            if (g != "") {
                g = mapAddress + "<br>" + g
            } else {
                g = mapAddress
            }
        }
    }
    if (h != "") {
        var d = new google.maps.InfoWindow({
            content: g,
            map: f,
            position: h
        })
    } else {
        var d = new google.maps.InfoWindow({
            content: g,
            map: f,
            position: {
                lat: c,
                lng: a
            }
        })
    }
    google.maps.event.addListener(b, "click", function() {
        d.open(f, b)
    })
}

function goGoogleMap() {
    var a = $("#google_map_dire").attr("href");
    var d = document.getElementById("travel_mode").value;
    if (typeof a !== "undefined") {
        var c = "dirflg=d";
        if (typeof d !== "undefined") {
            if (d == "DRIVING") {
                c = "dirflg=d"
            } else {
                if (d == "WALKING") {
                    c = "dirflg=w"
                } else {
                    if (d == "BICYCLING") {
                        c = "dirflg=b"
                    } else {
                        if (d == "TRANSIT") {
                            c = "dirflg=r"
                        }
                    }
                }
            }
        }
        var b = a + "&" + c;
        window.open(b, "_blank");
        window.focus()
    }
}

function logMap() {
    var a = "/ajax/ajax-log-map.lml";
    var b = {
        geo_address: mapAddress,
        merchant_id: merc_id,
        sponsor_status_d: sponsor_status,
        latitude_d: merc_geo_lat,
        longitude_d: merc_geo_lng
    };
    $.ajax({
        type: "POST",
        url: a,
        data: b,
        async: true
    })
}
$(function() {
    $("#travel_mode").change(function() {
        reCalcRoute()
    });
    $("#google_map_dire").click(function(a) {
        a.preventDefault();
        goGoogleMap();
        logMap()
    })
});
$(document).ready(function() {
    if (typeof doMap != "undefined") {
        if (doMap) {
            var b = "";
            if (typeof google_api_key != "undefined") {
                b = "//maps.googleapis.com/maps/api/js?callback=initMap&key=" + google_api_key
            } else {
                b = "//maps.googleapis.com/maps/api/js?callback=initMap"
            }
            var a = document.createElement("script");
            a.async = true;
            a.defer = true;
            a.type = "text/javascript";
            var c = "https:" == document.location.protocol;
            a.src = (c ? "https:" : "http:") + b;
            document.body.appendChild(a)
        }
    }
});

function ShowBoxBorder() {
    if (typeof b == "undefined") {
        var b;
        if (document.getElementById("chartcontainer")) {
            b = "chartcontainer"
        } else {
            b = "container_div"
        }
    }
    if (typeof showGrapeChart != "undefined") {
        if (typeof showChart != "undefined") {
            if (showChart && showGrapeChart) {
                $("#chart_div").css("display", "block");
                $("#chart_arrow").removeClass("icon-expand").addClass("icon-collapse")
            } else {
                $("#chart_div").css("display", "none");
                $("#chart_arrow").removeClass("icon-collapse").addClass("icon-expand")
            }
        }
    } else {
        if (typeof showChart != "undefined") {
            if (showChart) {
                $("#chart_div").css("display", "block");
                $("#chart_arrow").removeClass("icon-expand").addClass("icon-collapse")
            } else {
                $("#chart_div").css("display", "none");
                $("#chart_arrow").removeClass("icon-collapse").addClass("icon-expand")
            }
        }
    }
    if (typeof showRegionChart != "undefined") {
        if (typeof showChart2 != "undefined") {
            if (showChart2 && showRegionChart) {
                $("#chart_div_2").css("display", "block");
                $("#chart_arrow_2").removeClass("icon-expand").addClass("icon-collapse")
            } else {
                $("#chart_div_2").css("display", "none");
                $("#chart_arrow_2").removeClass("icon-collapse").addClass("icon-expand")
            }
        }
    } else {
        if (typeof showChart2 != "undefined") {
            if (showChart2) {
                $("#chart_div_2").css("display", "block");
                $("#chart_arrow_2").removeClass("icon-expand").addClass("icon-collapse")
            } else {
                $("#chart_div_2").css("display", "none");
                $("#chart_arrow_2").removeClass("icon-collapse").addClass("icon-expand")
            }
        }
    }
    if (typeof hideMap != "undefined") {
        if (hideMap) {
            $("#map_div").css("display", "none");
            $("#map_arrow").removeClass("icon-collapse").addClass("icon-expand")
        }
    }
    var a = 1;
    if ($("#map_div").css("display") == "block") {
        a = 0
    }
    try {
        if (parseInt(grapeCount) > 0) {
            a = 0
        }
    } catch (c) {}
    try {
        if (parseInt(chartCount) > 0) {
            a = 0
        }
    } catch (c) {}
    if ($("#img_div").css("display") == "block") {
        a = 0
    }
    if (a == 1) {
        $("#" + b).removeClass("Box_Border_On").addClass("Box_Border_Off");
        $("#" + b).css("display", "none")
    } else {
        $("#" + b).removeClass("Box_Border_Off").addClass("Box_Border_On");
        $("#" + b).css("display", "block")
    }
}

function drawPiechart() {
    Highcharts.theme = {
        chart: {
            borderWidth: 0,
            marginLeft: 0,
            marginRight: 130,
            marginBottom: 0,
            borderRadius: 1,
            backgroundColor: "#e7e7e8"
        },
        credits: {
            enabled: false
        },
        legend: {
            layout: "vertical",
            verticalAlign: "top",
            borderWidth: 0,
            margin: 5,
            align: "right",
            itemStyle: {
                width: 70,
                fontSize: "10px"
            },
            labelFormatter: function() {
                var j = this.name;
                var f = j.split(" ");
                var k = "";
                var h = "";
                var g = 1;
                for (i = 0; i < f.length; i++) {
                    if (k.length + f[i].length < 12) {
                        k = k + f[i];
                        h = h + " "
                    } else {
                        if (k.length == 0) {
                            k = f[i]
                        } else {
                            h = h + "<br>";
                            k = f[i]
                        }
                    }
                    h = h + f[i]
                }
                return h
            },
            symbolWidth: 10,
            x: 0,
            y: 0
        },
        tooltip: {
            style: {
                color: "#000",
                fontSize: "8pt",
                width: "120px"
            },
            formatter: function() {
                var j = this.point.name;
                var f = j.split(" ");
                var k = "";
                var h = "";
                var g = 1;
                for (i = 0; i < f.length; i++) {
                    if (k.length + f[i].length < 15) {
                        k = k + f[i];
                        h = h + " "
                    } else {
                        if (k.length == 0) {
                            k = f[i]
                        } else {
                            h = h + '</span><br><span style="font-weight:bold;">';
                            k = f[i];
                            g = 0
                        }
                    }
                    h = h + f[i]
                }
                return '<span style="font-weight:bold;">' + h + "</span>" + Math.round(this.percentage * 100) / 100 + "%"
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                center: ["63%", "55%"],
                size: "89%",
                cursor: "pointer",
                dataLabels: {
                    enabled: true,
                    connectorWidth: 1,
                    connectorPadding: 0,
                    distance: 5,
                    softConnector: false,
                    formatter: function() {
                        if (Math.round(this.percentage) >= 5) {
                            return Math.round(this.percentage) + " %"
                        } else {
                            return null
                        }
                    }
                },
                point: {
                    events: {
                        legendItemClick: function(g) {
                            g.preventDefault();
                            var f = this.x;
                            location.href = url_array[f]
                        }
                    }
                },
                showInLegend: true
            },
            series: {
                animation: false,
                events: {
                    click: function(g) {
                        var f = g.point.x;
                        location.href = url_array[f]
                    }
                }
            }
        }
    };
    var c = Highcharts.setOptions(Highcharts.theme);
    try {
        var a = new Highcharts.Chart({
            chart: {
                renderTo: "chart_div2"
            },
            title: {
                text: "Click chart for more info",
                align: "left",
                style: {
                    color: "#3E576F",
                    fontSize: "10px"
                }
            },
            series: [{
                name: null,
                type: "pie",
                data: data
            }]
        });
        document.getElementById("chartHeader").style.display = "block";
        document.getElementById("chart_div").style.display = "block";
        document.getElementById(chartContainer).style.display = "block"
    } catch (d) {
        var b = null;
        b = document.getElementById("chartHeader");
        if (b != null) {
            b.style.display = "none"
        }
        b = document.getElementById("chart_div");
        if (b != null) {
            b.style.display = "none"
        }
        if (typeof(chartContainer) != "undefined") {
            b = document.getElementById(chartContainer);
            if (b != null) {
                b.style.display = "none"
            }
        }
    }
    $("#chartHeader").css("display", "block")
}

function drawPiechart2() {
    Highcharts.theme = {
        chart: {
            borderWidth: 0,
            marginLeft: 0,
            marginRight: 130,
            marginBottom: 0,
            borderRadius: 1,
            backgroundColor: "#e7e7e8"
        },
        credits: {
            enabled: false
        },
        legend: {
            layout: "vertical",
            verticalAlign: "top",
            borderWidth: 0,
            margin: 5,
            align: "right",
            itemStyle: {
                width: 70,
                fontSize: "10px"
            },
            labelFormatter: function() {
                var j = this.name;
                var f = j.split(" ");
                var k = "";
                var h = "";
                var g = 1;
                for (i = 0; i < f.length; i++) {
                    if (k.length + f[i].length < 12) {
                        k = k + f[i];
                        h = h + " "
                    } else {
                        if (k.length == 0) {
                            k = f[i]
                        } else {
                            h = h + "<br>";
                            k = f[i]
                        }
                    }
                    h = h + f[i]
                }
                return h
            },
            symbolWidth: 10,
            x: 0,
            y: 0
        },
        tooltip: {
            style: {
                color: "#000",
                fontSize: "8pt",
                width: "120px"
            },
            formatter: function() {
                var j = this.point.name;
                var f = j.split(" ");
                var k = "";
                var h = "";
                var g = 1;
                for (i = 0; i < f.length; i++) {
                    if (k.length + f[i].length < 15) {
                        k = k + f[i];
                        h = h + " "
                    } else {
                        if (k.length == 0) {
                            k = f[i]
                        } else {
                            h = h + '</span><br><span style="font-weight:bold;">';
                            k = f[i];
                            g = 0
                        }
                    }
                    h = h + f[i]
                }
                return '<span style="font-weight:bold;">' + h + "</span>" + Math.round(this.percentage * 100) / 100 + "%"
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                center: ["63%", "55%"],
                size: "89%",
                cursor: "pointer",
                dataLabels: {
                    enabled: true,
                    connectorWidth: 1,
                    connectorPadding: 0,
                    distance: 5,
                    softConnector: false,
                    formatter: function() {
                        if (Math.round(this.percentage) >= 5) {
                            return Math.round(this.percentage) + " %"
                        } else {
                            return null
                        }
                    }
                },
                point: {
                    events: {
                        legendItemClick: function(g) {
                            g.preventDefault();
                            var f = this.x;
                            location.href = url_array2[f]
                        }
                    }
                },
                showInLegend: true
            },
            series: {
                animation: false,
                events: {
                    click: function(g) {
                        var f = g.point.x;
                        location.href = url_array2[f]
                    }
                }
            }
        }
    };
    var c = Highcharts.setOptions(Highcharts.theme);
    try {
        var a = new Highcharts.Chart({
            chart: {
                renderTo: "chart_div2_2"
            },
            title: {
                text: "Click chart for more info",
                align: "left",
                style: {
                    color: "#3E576F",
                    fontSize: "10px"
                }
            },
            series: [{
                name: null,
                type: "pie",
                data: data2
            }]
        });
        document.getElementById("chartHeader_2").style.display = "block";
        document.getElementById("chart_div_2").style.display = "block";
        document.getElementById(chartContainer).style.display = "block"
    } catch (d) {
        var b = null;
        b = document.getElementById("chartHeader_2");
        if (b != null) {
            b.style.display = "none"
        }
        b = document.getElementById("chart_div_2");
        if (b != null) {
            b.style.display = "none"
        }
        if (typeof(chartContainer) != "undefined") {
            b = document.getElementById(chartContainer);
            if (b != null) {
                b.style.display = "none"
            }
        }
    }
    $("#chartHeader_2").css("display", "block")
}

function JSONscriptRequest(a) {
    this.fullUrl = a;
    this.noCacheIE = "&noCacheIE=" + (new Date).getTime();
    this.headLoc = document.getElementsByTagName("head").item(0);
    this.scriptId = "YJscriptId" + JSONscriptRequest.scriptCounter++
}

function addScript(b) {
    var a = new JSONscriptRequest(b);
    a.buildScriptTag();
    a.addScriptTag()
}

function get_data(a) {
    $.each(a.markers, function(d, b) {
        var f = new google.maps.LatLng(parseFloat(b.lat), parseFloat(b.lng));
        var c = b.regionname;
        var b = new google.maps.Marker({
            map: m_region,
            position: f,
            title: c,
            html: '<div style="text-align:center">View detailed information about <a href="/regions-' + c.replace(" ", "+") + '"><u>' + c + "</u></a></div>",
            icon: "http://sa5.wine-searcher.net/images/ws23.png",
            clickable: true
        });
        google.maps.event.addListener(b, "click", function() {
            infowindow_region.setContent(this.html);
            infowindow_region.open(m_region, this)
        })
    })
}

function hideInit() {
    if (documenturl == "") {
        documenturl = std_url
    }
    documenturl = documenturl.replace("?Xhide_chart=Y", "");
    documenturl = documenturl.replace("&Xhide_chart=Y", "");
    documenturl = documenturl.replace("?Xhide_chart=N", "");
    documenturl = documenturl.replace("&Xhide_chart=N", "");
    if (documenturl.indexOf("?") > 0) {
        refurl = documenturl + "&Xhide_chart=" + chart_t_yn
    } else {
        refurl = documenturl + "?Xhide_chart=" + chart_t_yn
    }
    document.getElementById("hide_chart_graph_link").href = refurl
}(function(b) {
    var a = document.createElement("input");
    b.extend(b.support, {
        placeholder: !!("placeholder" in a)
    });
    b.fn.addPlaceholder = function(d) {
        function h(k, j) {
            if (c(k.val()) || k.val() == j) {
                k.val(j), k.addClass(f["class"])
            }
            k.focusin(function() {
                k.hasClass(f["class"]) && (k.removeClass(f["class"]), k.val(""))
            });
            k.focusout(function() {
                c(k.val()) && (k.val(j), k.addClass(f["class"]))
            })
        }

        function g(j, m) {
            j.addClass(f["class"]);
            var k = b("<span/>", {
                "class": j.attr("class") + " " + f["class"],
                text: m,
                css: {
                    border: "none",
                    cursor: "text",
                    background: "transparent",
                    position: "absolute",
                    top: j.position().top,
                    left: j.position().left,
                    lineHeight: j.height() + 3 + "px",
                    paddingLeft: parseFloat(j.css("paddingLeft")) + 2 + "px"
                }
            }).insertAfter(j);
            j.focusin(function() {
                j.hasClass(f["class"]) && (k.hide(), j.removeClass(f["class"]))
            });
            j.focusout(function() {
                c(j.val()) && (k.show(), j.addClass(f["class"]))
            });
            f.checkafill && function l() {
                !c(j.val()) && j.hasClass(f["class"]) && j.focusin();
                setTimeout(l, 250)
            }()
        }

        function c(j) {
            return f.allowspaces ? j === "" : b.trim(j) === ""
        }
        var f = {
            "class": "placeholder",
            allowspaces: !1,
            dopass: !0,
            dotextarea: !0,
            checkafill: !1
        };
        return this.each(function() {
            if (b.support.placeholder) {
                return !1
            }
            b.extend(f, d);
            if (!(this.tagName.toLowerCase() == "input" || f.dotextarea && this.tagName.toLowerCase() == "textarea")) {
                return !0
            }
            var k = b(this),
                l = this.getAttribute("placeholder"),
                j = k.is("input[type=password]");
            if (!l) {
                return !0
            }
            f.dopass && j ? g(k, l) : j || h(k, l)
        })
    }
})(jQuery);
$(".formplaceholder").addPlaceholder();
var processing = 0;
var flds_tidy = false;
$(function() {
    $(".sch-main-fld-clear,.sch-zip-fld-clear").mousedown(function(a) {
        $(this).css("visibility", "hidden");
        resetFldDefault($(this).attr("id"));
        a.preventDefault()
    })
});
$(function() {
    $(".formplaceholder").focus(function() {
        var b = false;
        var a = new Array("wine name", "nom du vin", "nome del vino", "name des weins", "nombre del vino", "vintage", "vint", "ann?e", "annata", "jahr", "cosecha", "email@example.com", "password", "zip code");
        b = a.toString().indexOf($(this).val().toLowerCase()) > -1;
        if (b) {
            $(this).val("")
        }
        if ($(this).val() != "") {
            $("#" + $(this).attr("id") + "__clear").css("visibility", "visible")
        }
    })
});
$(function() {
    $(".sch-fld-main,.sch-fld-zip").keyup(function() {
        if ($(this).val() != "") {
            $("#" + $(this).attr("id") + "__clear").css("visibility", "visible")
        } else {
            $("#" + $(this).attr("id") + "__clear").css("visibility", "hidden")
        }
    })
});
$(function() {
    $(document).ready(function() {
        if (typeof($("#Xlocation").val()) != "undefined") {
            if ($("#Xlocation").val() == "USA") {
                if (schfull === "Y") {
                    show_states()
                }
            }
        }
    })
});
$(function() {
    $("#change_currency_link_w").click(function(a) {
        if ($("#login-box").length != 0) {
            $("#login-box").removeClass("login-box-open").addClass("hide");
            $("a#login_header_href").removeClass("opened");
            $("a#login_header_href span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        if ($("#promenu").length != 0) {
            $("#promenu").removeClass("ddpvmenu").addClass("hide");
            $("a#myaccount").removeClass("opened");
            $("a#myaccount span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        $(this).toggleClass("opened");
        if ($(this).hasClass("opened")) {
            $("#currency-box").removeClass("currency-box-close").addClass("currency-box-open");
            $("a#change_currency_link_w span").removeClass("droparrow-down2").addClass("droparrow-up2")
        } else {
            $("#currency-box").removeClass("currency-box-open").addClass("currency-box-close");
            $("a#change_currency_link_w span").removeClass("droparrow-up2").addClass("droparrow-down2")
        }
        a.preventDefault();
        a.stopPropagation();
        return false
    });
    $("a#login_header_href").click(function(a) {
        if ($("#search-box").length != 0) {
            $("#search-box").removeClass("search-box-open").addClass("hide");
            $("li.nav-home a").removeClass("opened");
            $("li.nav-home a span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        if ($("#currency-box").length != 0) {
            $("#currency-box").removeClass("currency-box-open").addClass("currency-box-close");
            $("#change_currency_link_w").removeClass("opened");
            $("a#change_currency_link_w span").removeClass("droparrow-up2").addClass("droparrow-down2")
        }
        $(this).toggleClass("opened");
        if ($(this).hasClass("opened")) {
            $("#login-box").removeClass("hide").addClass("login-box-open");
            $("a#login_header_href span").removeClass("droparrow-down").addClass("droparrow-up")
        } else {
            $("#login-box").removeClass("login-box-open").addClass("hide");
            $("a#login_header_href span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        a.preventDefault();
        a.stopPropagation();
        return false
    });
    $("li.nav-home a").click(function(a) {
        if ($("#login-box").length != 0) {
            $("#login-box").removeClass("login-box-open").addClass("hide");
            $("a#login_header_href").removeClass("opened");
            $("a#login_header_href span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        if ($("#promenu").length != 0) {
            $("#promenu").removeClass("ddpvmenu").addClass("hide");
            $("a#myaccount").removeClass("opened");
            $("a#myaccount span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        $(this).toggleClass("opened");
        if ($(this).hasClass("opened")) {
            $("#search-box").removeClass("hide").addClass("search-box-open");
            $("li.nav-home a span").removeClass("droparrow-down").addClass("droparrow-up")
        } else {
            $("#search-box").removeClass("login-box-open").addClass("hide");
            $("li.nav-home a span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        a.preventDefault();
        a.stopPropagation();
        return false
    });
    $("a#myaccount").click(function(a) {
        if ($("#search-box").length != 0) {
            $("#search-box").removeClass("search-box-open").addClass("hide");
            $("li.nav-home a").removeClass("opened");
            $("li.nav-home a span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        if ($("#currency-box").length != 0) {
            $("#currency-box").removeClass("currency-box-open").addClass("currency-box-close");
            $("#change_currency_link_w").removeClass("opened");
            $("a#change_currency_link_w span").removeClass("droparrow-up2").addClass("droparrow-down2")
        }
        $(this).toggleClass("opened");
        if ($(this).hasClass("opened")) {
            $("#promenu").removeClass("hide").addClass("ddpvmenu");
            $("a#myaccount span").removeClass("droparrow-down").addClass("droparrow-up")
        } else {
            $("#promenu").removeClass("ddpvmenu").addClass("hide");
            $("a#myaccount span").removeClass("droparrow-up").addClass("droparrow-down")
        }
        a.preventDefault();
        a.stopPropagation();
        return false
    })
});
$(function() {
    $(".exclude").click(function() {
        var g = /[0-9]+/;
        var b = $(this).attr("id").match(g);
        var j = $(this).attr("href");
        var f = document.getElementsByName("merchant" + b);
        var d = f.length;
        var h = document.getElementsByName("favourite" + b);
        var a = f.length;
        if (j == "#Exclude") {
            for (i = 0; i < d; i++) {
                f[i].innerHTML = "Excluding ... "
            }
        } else {
            for (i = 0; i < d; i++) {
                f[i].innerHTML = "Including ... "
            }
        }
        if (isTWM == true) {
            if (j == "#Exclude") {
                var c = confirm("Do you want to exclude ALL Total Wine & More stores?\n\nClick OK to exclude ALL or Cancel to exclude only this store.");
                if (c == true) {
                    j = j + "ALL"
                }
            } else {
                var c = confirm("Do you want to include ALL Total Wine & More stores?\n\nClick OK to include ALL or Cancel to include only this store.");
                if (c == true) {
                    j = j + "ALL"
                }
            }
        }
        ajax_url = "/prof/ajax-exclude.lml?submit_exclude_F=" + j.replace("#", "") + "&merchant_id_F=" + b;
        $.ajax({
            url: ajax_url,
            success: function(l, k) {
                if (l.toLowerCase().indexOf("sorry") > -1) {
                    if (j == "#Exclude" || j == "#ExcludeALL") {
                        for (i = 0; i < d; i++) {
                            f[i].innerHTML = "Exclude from searches"
                        }
                    } else {
                        for (i = 0; i < d; i++) {
                            f[i].innerHTML = "Include in searches"
                        }
                    }
                    alert($(l).text())
                } else {
                    if (j == "#Exclude" || j == "#ExcludeALL") {
                        for (i = 0; i < d; i++) {
                            f[i].innerHTML = "Include in searches";
                            f[i].setAttribute("href", "#Include");
                            f[i].setAttribute("title", "Include this merchant in your searches");
                            $("#" + f[i].id).toggleClass("exc-minus", true)
                        }
                        for (i = 0; i < a; i++) {
                            h[i].setAttribute("style", "display : none")
                        }
                    } else {
                        for (i = 0; i < d; i++) {
                            f[i].innerHTML = "Exclude from searches";
                            f[i].setAttribute("href", "#Exclude");
                            f[i].setAttribute("title", "Exclude this merchant from your searches");
                            $("#" + f[i].id).toggleClass("exc-minus", false)
                        }
                        for (i = 0; i < a; i++) {
                            h[i].setAttribute("style", "display : inline-block")
                        }
                    }
                }
            },
            error: function() {}
        })
    })
});
$(function() {
    $(".favourite").click(function() {
        var f = /[0-9]+/;
        var b = $(this).attr("id").match(f);
        var h = $(this).attr("href");
        var d = document.getElementsByName("favourite" + b);
        var c = d.length;
        var g = document.getElementsByName("merchant" + b);
        var a = d.length;
        if (h == "#Add") {
            for (i = 0; i < c; i++) {
                d[i].innerHTML = "Adding ... "
            }
        } else {
            for (i = 0; i < c; i++) {
                d[i].innerHTML = "Removing ... "
            }
        }
        ajax_url = "/prof/ajax-favourite.lml?submit_favourite_F=" + h.replace("#", "") + "&merchant_id_F=" + b;
        $.ajax({
            url: ajax_url,
            success: function(l, j) {
                if (l.toLowerCase().indexOf("sorry") > -1) {
                    if (h == "#Add") {
                        for (i = 0; i < c; i++) {
                            d[i].innerHTML = "Add to favorites"
                        }
                    } else {
                        for (i = 0; i < c; i++) {
                            d[i].innerHTML = "Remove from favorites"
                        }
                    }
                    var k = $("<div></div>").html(l).dialog({
                        autoOpen: false,
                        title: "Favorite Merchants limit reached"
                    });
                    k.dialog("open")
                } else {
                    if (h == "#Add") {
                        for (i = 0; i < c; i++) {
                            d[i].innerHTML = "Remove from favorites";
                            d[i].setAttribute("href", "#Remove");
                            d[i].setAttribute("title", "Remove this merchant from your favorites list");
                            $("#" + d[i].id).toggleClass("fav-minus", true)
                        }
                        for (i = 0; i < a; i++) {
                            g[i].setAttribute("style", "display : none")
                        }
                    } else {
                        for (i = 0; i < c; i++) {
                            d[i].innerHTML = "Add to favorites";
                            d[i].setAttribute("href", "#Add");
                            d[i].setAttribute("title", "Add this merchant to your favorites list");
                            $("#" + d[i].id).toggleClass("fav-minus", false)
                        }
                        for (i = 0; i < a; i++) {
                            g[i].setAttribute("style", "display : inline-block")
                        }
                    }
                }
            },
            error: function() {}
        })
    })
});
$(function() {
    $("#map_a").click(function() {
        if ($("#map_arrow").hasClass("icon-collapse")) {
            $("#map_div").css("display", "none");
            $("#map_arrow").removeClass("icon-collapse").addClass("icon-expand");
            $("#map_a").attr("title", "Show map");
            $("#mapHeader").addClass("header-collapsed")
        } else {
            $("#map_div").css("display", "block");
            $("#map_arrow").removeClass("icon-expand").addClass("icon-collapse");
            $("#map_a").attr("title", "Hide map");
            $("#mapHeader").removeClass("header-collapsed")
        }
        return false
    })
});
$(function() {
    $("#chart_a").click(function() {
        if ($("#chart_arrow").hasClass("icon-collapse")) {
            $("#chart_div").css("display", "none");
            $("#chart_arrow").removeClass("icon-collapse").addClass("icon-expand");
            $("#chart_a").attr("title", "Show chart");
            $("#chartHeader").addClass("header-collapsed")
        } else {
            $("#chart_div").css("display", "block");
            $("#chart_arrow").removeClass("icon-expand").addClass("icon-collapse");
            $("#chart_a").attr("title", "Hide chart");
            $("#chartHeader").removeClass("header-collapsed")
        }
        return false
    });
    $("#chart_a_2").click(function() {
        if ($("#chart_arrow_2").hasClass("icon-collapse")) {
            $("#chart_div_2").css("display", "none");
            $("#chart_arrow_2").removeClass("icon-collapse").addClass("icon-expand");
            $("#chart_a_2").attr("title", "Show chart");
            $("#chartHeader").addClass("header-collapsed")
        } else {
            $("#chart_div_2").css("display", "block");
            $("#chart_arrow_2").removeClass("icon-expand").addClass("icon-collapse");
            $("#chart_a_2").attr("title", "Hide chart");
            $("#chartHeader_2").removeClass("header-collapsed")
        }
        return false
    })
});
$(function() {
    $("#img_a").click(function() {
        if ($("#img_arrow").hasClass("icon-collapse")) {
            $("#img_div").css("display", "none");
            $("#img_arrow").removeClass("icon-collapse").addClass("icon-expand");
            $("#img_a").attr("title", "Show picture");
            $("#imgHeader").addClass("header-collapsed")
        } else {
            $("#img_div").css("display", "block");
            $("#img_arrow").removeClass("icon-expand").addClass("icon-collapse");
            $("#img_a").attr("title", "Hide picture");
            $("#imgHeader").removeClass("header-collapsed")
        }
        return false
    })
});
$(function() {
    $("#tn_search").click(function() {
        var c = new google.search.CustomSearchControl("018148841331049500731:wfkvkqdgcw0");
        c.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
        c.setLinkTarget(google.search.Search.LINK_TARGET_SELF);
        var a = new google.search.DrawOptions;
        a.setInput(document.getElementById("cse_query_input"));
        c.draw("cse", a);
        var d = $("#cse_query_input").val();
        var b = $("#wid").val();
        c.execute(d);
        _gaq.push(["_trackEvent", "Google Site Search", "Wine Detail Page - Tasting Notes", b]);
        return false
    })
});
$(function() {
    $("#hide_panel").click(function() {
        var a = (new Date).valueOf().toString();
        $(".col1").addClass("col1-alt");
        $(".col1").removeClass("col1");
        $(".col2").addClass("col2-alt");
        $(".col2").removeClass("col2");
        $("#show_panel_div").removeClass("displaynone");
        $("#more_info").removeClass("displaynone");
        $.ajax({
            url: "/show-hide-panel.lml?hide_F=Y&t=" + a
        });
        return false
    })
});
$(function() {
    $("#show_panel").click(function() {
        var a = (new Date).valueOf().toString();
        $(".col1-alt").addClass("col1");
        $(".col1-alt").removeClass("col1-alt");
        $(".col2-alt").addClass("col2");
        $(".col2-alt").removeClass("col2-alt");
        $("#show_panel_div").addClass("displaynone");
        $("#more_info").addClass("displaynone");
        $.ajax({
            url: "/show-hide-panel.lml?hide_F=N&t=" + a
        });
        return false
    })
});

function getBrowser() {
    var b = navigator.userAgent,
        a, c = b.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(c[1])) {
        a = /\brv[ :]+(\d+)/g.exec(b) || [];
        return "IE " + (a[1] || "")
    }
    if (c[1] === "Chrome") {
        a = b.match(/\bOPR\/(\d+)/);
        if (a != null) {
            return "Opera " + a[1]
        }
    }
    c = c[2] ? [c[1], c[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((a = b.match(/version\/(\d+)/i)) != null) {
        c.splice(1, 1, a[1])
    }
    return c.join("/")
}
var detectedBrowser, detectedBrowserName, detectedBrowserVersion;

function getBrowserInfo(a) {
    detectedBrowser = a.toLowerCase();
    if (detectedBrowser.search("/") !== -1) {
        detectedBrowser = detectedBrowser.split("/");
        detectedBrowserName = detectedBrowser[0];
        detectedBrowserVersion = detectedBrowser[1]
    } else {
        detectedBrowserName = detectedBrowser.match(/[a-z]+/);
        detectedBrowserVersion = detectedBrowser.match(/\d+/)
    }
}
if (typeof(qprMerchantId) === "undefined") {
    qprMerchantId = 0
}
if (typeof(qprRegionId) === "undefined") {
    qprRegionId = 0
}
if (typeof(qprGrapeId) === "undefined") {
    qprGrapeId = 0
}
if (typeof(qprFoodCategoryId) === "undefined") {
    qprFoodCategoryId = 0
}

function qprCountry(a) {
    if (a == "all") {
        if (document.getElementById("qpr_all_country").checked == true) {
            document.getElementById("qpr_country").checked = false;
            qpr_country_option = "all"
        } else {
            document.getElementById("qpr_country").checked = true;
            qpr_country_option = a
        }
    } else {
        if (document.getElementById("qpr_country").checked == true) {
            document.getElementById("qpr_all_country").checked = false;
            qpr_country_option = a
        } else {
            document.getElementById("qpr_all_country").checked = true;
            qpr_country_option = "all"
        }
    }
    DrawQpr()
}

function DrawQpr() {
    var c = $.cookie("price");
    if (c == null) {
        c = priceAvg;
        $.cookie("price", priceAvg)
    }
    var a = "";
    if (document.getElementById("qpr_red") && document.getElementById("qpr_white")) {
        if (document.getElementById("qpr_red").checked && document.getElementById("qpr_white").checked) {
            a = ""
        } else {
            if (document.getElementById("qpr_red").checked) {
                a = "red"
            } else {
                if (document.getElementById("qpr_white").checked) {
                    a = "white"
                } else {
                    a = "any"
                }
            }
        }
    }
    var b;
    if (typeof qpr_country_option != "undefined") {
        b = qpr_country_option
    } else {
        b = ""
    }
    if (typeof(qprMerchantId) !== "undefined" && qprMerchantId > 0 && qprPage == "merchant") {
        ajax_url = "/ajax/ajax-qpr.lml?page_F=" + qprPage + "&merchant_id_F=" + qprMerchantId + "&price_base_F=" + c + "&grape_colour_F=" + a + "&init_F=" + qprInit + "&price_min_F=" + priceMin + "&price_max_F=" + priceMax + "&price_avg_F=" + priceAvg
    } else {
        if (typeof(qprRegionId) !== "undefined" && qprRegionId > 0 && qprPage == "region") {
            ajax_url = "/ajax/ajax-qpr.lml?page_F=" + qprPage + "&region_id_F=" + qprRegionId + "&price_base_F=" + c + "&country_F=" + b + "&grape_colour_F=" + a + "&init_F=" + qprInit + "&price_min_F=" + priceMin + "&price_max_F=" + priceMax + "&price_avg_F=" + priceAvg
        } else {
            if (typeof(qprGrapeId) !== "undefined" && qprGrapeId > 0 && qprPage == "grape") {
                ajax_url = "/ajax/ajax-qpr.lml?page_F=" + qprPage + "&grape_id_F=" + qprGrapeId + "&price_base_F=" + c + "&country_F=" + b + "&grape_colour_F=" + a + "&init_F=" + qprInit + "&price_min_F=" + priceMin + "&price_max_F=" + priceMax + "&price_avg_F=" + priceAvg
            } else {
                if (typeof(qprFoodCategoryId) !== "undefined" && qprFoodCategoryId > 0 && qprPage == "food") {
                    ajax_url = "/ajax/ajax-qpr.lml?page_F=" + qprPage + "&food_category_id_F=" + qprFoodCategoryId + "&price_base_F=" + c + "&country_F=" + b + "&grape_colour_F=" + a + "&init_F=" + qprInit + "&price_min_F=" + priceMin + "&price_max_F=" + priceMax + "&price_avg_F=" + priceAvg
                }
            }
        }
    }
    $("#ajax_results").html('<div class="loading-wrapper"><span class="loading-icon"></span></div>');
    $.ajax({
        url: ajax_url,
        success: function(f, d) {
            if (qprInit) {
                $("#qprcontainer").html(f);
                qprInit = false;
                addSliderbar()
            } else {
                $("#ajax_results").html(f)
            }
            if (qprRegionId > 0 || qprGrapeId > 0 || qprFoodCategoryId > 0) {
                if (f.indexOf("Search area expanded to 'The World'") > -1) {
                    $("#qpr_country").prop("checked", false);
                    $("#qpr_all_country").prop("checked", true);
                    qpr_country_option = "all"
                }
            }
        },
        error: function() {
            $("#ajax_results").html('<div class="qpr_result errortxt"><div style="padding:4px;">No recommendations for this price range</div></div>')
        }
    })
}
if (typeof(doQpr) != "undefined") {
    if (typeof(qprMerchantId) !== "undefined" && qprMerchantId > 0) {
        if ($.cookie("price_m") == null) {
            $.cookie("price_m", priceAvg)
        }
        $.cookie("price", $.cookie("price_m"))
    } else {
        if (typeof(qprRegionId) !== "undefined" && qprRegionId > 0) {
            if ($.cookie("price_r") == null) {
                $.cookie("price_r", priceAvg)
            }
            $.cookie("price", $.cookie("price_r"))
        } else {
            if (typeof(qprGrapeId) !== "undefined" && qprGrapeId > 0) {
                if ($.cookie("price_g") == null) {
                    $.cookie("price_g", priceAvg)
                }
                $.cookie("price", $.cookie("price_g"))
            } else {
                if (typeof(qprFoodCategoryId) !== "undefined" && qprFoodCategoryId > 0) {
                    if ($.cookie("price_f") == null) {
                        $.cookie("price_f", priceAvg)
                    }
                    $.cookie("price", $.cookie("price_f"))
                }
            }
        }
    }
    if (doQpr) {
        DrawQpr()
    }
}

function addSliderbar() {
    $("#ws-slider").slider({});
    $("#slider-range").css("height", "auto");
    $("#slider-range").css("padding", "5px 0px");
    $("#slider-range").css("margin", "0px 0px 0px 10px");
    detectedBrowser = getBrowser();
    getBrowserInfo(detectedBrowser);
    if (detectedBrowserName === "msie" && detectedBrowserVersion < 9) {
        $("#slider-range .slider-track").css("filter", "none");
        $("#slider-range .slider-track").css("background-color", "#bababa");
        $("#slider-range .slider-selection").css("filter", "none");
        $("#slider-range .slider-selection").css("background-color", "#666")
    }
    $("#ws-slider").slider().on("slide", function(b) {
        var a = $("#ws-slider").data("slider").getValue();
        if (isNaN(a)) {
            a = 0
        }
        $("#base_price_F").text(a)
    });
    $("#ws-slider").slider().on("slideStop", function(b) {
        var a = document.getElementById("base_price_F").innerHTML;
        $.cookie("price", a);
        if (qprMerchantId > 0) {
            $.cookie("price_m", a)
        } else {
            if (qprGrapeId > 0) {
                $.cookie("price_g", a)
            } else {
                if (qprRegionId > 0) {
                    $.cookie("price_r", a)
                } else {
                    if (qprFoodCategoryId > 0) {
                        $.cookie("price_f", a)
                    }
                }
            }
        }
        if (!qprInit) {
            DrawQpr()
        }
    })
}
$(function() {
    loadSortHandlers()
});

function isArrExist(a, c) {
    var d = a;
    for (var b = 0; b < c.length; b++) {
        if (c[b] in d) {
            d = d[c[b]]
        } else {
            return false
        }
    }
    return true
}
var classModalBox = function(a) {
    this.init(a)
};
var modalFull = "N";
$.extend(classModalBox.prototype, {
    mainModalId: "modalBox",
    init: function(a) {
        this.mainModalId = a;
        detectedBrowser = getBrowser();
        getBrowserInfo(detectedBrowser);
        var b;
        if (detectedBrowserName === "msie" && detectedBrowserVersion < 9) {
            b = '<div id="' + this.mainModalId + '" class="modal hide" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true">'
        } else {
            if (modalFull == "Y") {
                b = '<div id="' + this.mainModalId + '" class="modal modalfull hide fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true">'
            } else {
                b = '<div id="' + this.mainModalId + '" class="modal hide fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true">'
            }
        }
        b += '<div class="modal-header">';
        b += '	<h2 id="modelHeader">Modal header</h2>';
        b += "</div>";
        b += '<div class="modal-body"><div class="modal-body-content"></div></div>';
        b += '<div class="modal-footer">';
        b += '	<button id="okButtonModal" class="modal-btn modal-btn-primary">Search</button>';
        b += '	<button id="closeButtonModal" class="modal-btn" data-dismiss="modal" aria-hidden="true">Close</button>';
        b += "</div>";
        b += "</div>";
        if (!($("#" + this.mainModalId).length)) {
            $("body").append(b)
        }
    },
    enableHeader: function(a) {
        if (a == false) {
            $(".modal-header").hide()
        } else {
            $(".modal-header").show()
        }
    },
    enableFooter: function(a) {
        if (a == false) {
            $(".modal-footer").hide()
        } else {
            $(".modal-footer").show()
        }
    },
    setAttr: function(a) {
        $(".modal-footer").show();
        $(".modal-header").show();
        $("#closeButtonModal").show();
        $("#okButtonModal").show();
        if (isArrExist(a, ["header"])) {
            if (isArrExist(a, ["header", "show"])) {
                if (a.header.show == false) {
                    $(".modal-header").hide()
                } else {
                    $(".modal-header").show();
                    $("#modelHeader").html(a.header.title)
                }
            }
        }
        if (isArrExist(a, ["body"])) {
            $(".modal-body div").html(a.body)
        }
        if (isArrExist(a, ["footer"])) {
            if (isArrExist(a, ["footer", "show"])) {
                if (a.footer.show == false) {
                    $(".modal-footer").hide()
                }
            }
            if (isArrExist(a, ["footer", "closeButton", "show"])) {
                if (a.footer.closeButton.show == false) {
                    $("#closeButtonModal").hide()
                }
            }
            if (isArrExist(a, ["footer", "closeButton", "label"])) {
                $("#closeButtonModal").html(a.footer.closeButton.label)
            }
            if (isArrExist(a, ["footer", "okButton", "show"])) {
                if (a.footer.okButton.show == false) {
                    $("#okButtonModal").hide()
                }
            }
            if (isArrExist(a, ["footer", "okButton", "label"])) {
                $("#okButtonModal").html(a.footer.okButton.label)
            }
            if (isArrExist(a, ["footer", "closeButton", "onClick"])) {
                $("#closeButtonModal").unbind("click");
                $("#closeButtonModal").bind("click", "#closeButtonModal", a.footer.closeButton.onClick)
            }
            if (isArrExist(a, ["footer", "okButton", "onClick"])) {
                $("#okButtonModal").unbind("click");
                $("#okButtonModal").bind("click", "#okButtonModal", a.footer.okButton.onClick)
            }
        }
    }
});
$(function() {
    $(".showFullLabel1").click(function() {
        loadFullLabel();
        return false
    });
    $(document).on("keydown", function(a) {
        if (a.keyCode == 27) {
            $("#modalBox").focus()
        }
    })
});

function loadFullLabel() {
    if ($("#showFullLabel").attr("href") == undefined) {
        return false
    }
    detectedBrowser = getBrowser();
    getBrowserInfo(detectedBrowser);
    if (detectedBrowserName === "msie" && detectedBrowserVersion < 9) {
        var j;
        arrImgW[currentImg] <= 580 ? j = 600 : j = arrImgW[currentImg] + 20;
        var b = $(window).width() / 2 - j / 2;
        var a = $(window).height() / 2 - 300;
        b = b + "px";
        a = a + "px";
        j = j + "px"
    }
    var f = '<div id="dialog" align="center">';
    if (maxImg > 0) {
        f += '<div style="text-align:center;padding:3px;"><a id="prevLblImg" href="' + document.location.href + '" class="prevImg" title="Show previous label"> &lt; </a>';
        f += ' <a id="nextLblImg" href="' + document.location.href + '" class="nextImg" title="Show next label"> &gt; </a></div>';
        f += '<div class="smallish"><span id="img_low" class="boldtxt">' + (currentImg + 1).toString() + '</span> of <span id="img_high" class="boldtxt">' + (maxImg + 1).toString() + "</span></div>"
    }
    f += '<img id="imgLabel" src="';
    if (typeof label_alt === "undefined") {
        f += imgAkamaiURL + arrImgSrc[currentImg] + '" alt="' + arrLabelAlt[currentImg] + '" width="' + arrImgW[currentImg] + '" height="' + arrImgH[currentImg] + '" />'
    } else {
        f += imgAkamaiURL + arrImgSrc[currentImg] + '" alt="' + label_alt + '" width="' + arrImgW[currentImg] + '" height="' + arrImgH[currentImg] + '" />'
    }
    f += '<div id="url_source_fix" class="smallest"></div>';
    f += '<div class="smallest"><BR>(Esc to close)</div>';
    f += '<img style="display:none" src="/images/ajax-loader-horiz.gif" width="220" height="220" alt="loading">';
    f += "</div>";
    modalFull = "Y";
    if ($("#modalBox").length) {
        $("#modalBox").remove();
        $(".modal-backdrop").remove()
    }
    var h = new classModalBox("modalBox");
    var c = f;
    var d = "";
    if (typeof title_label_dialog === "undefined") {
        d = arrTitleLabelDialog[currentImg]
    } else {
        d = title_label_dialog
    }
    h.setAttr({
        header: {
            show: true,
            title: d
        },
        body: c,
        footer: {
            show: true,
            closeButton: {
                onClick: function() {
                    $("#modalBox").modal("hide")
                },
                show: false,
                label: "Close"
            },
            okButton: {
                onClick: function() {
                    $("#modalBox").modal("hide")
                },
                show: true,
                label: "Close"
            }
        }
    });
    $("#modalBox").modal();
    if (detectedBrowserName === "msie" && detectedBrowserVersion < 9) {
        $("html, body").animate({
            scrollTop: 0
        }, 0);
        $("#modalBox").css({
            width: j,
            top: a,
            left: b
        })
    } else {}
    $("#okButtonModal").css("marginLeft", "0");
    $("#modalBox").on("hidden", function() {
        $("#modalBox").remove();
        $(".modal-backdrop").remove();
        $("body").removeClass("modal-open")
    });
    if (maxImg > 0) {
        $(function() {
            $("#nextLblImg").click(function() {
                getLabelImg(true, false);
                return false
            })
        });
        $(function() {
            $("#prevLblImg").click(function() {
                getLabelImg(false, false);
                return false
            })
        })
    }
    var g = $("#imgLabel");
    if ($("#imgLabel").length != 0) {
        $(function() {
            $("#imgLabel").load(function() {
                $("#loadingImgAnim").delay(500).slideUp("fast", function() {
                    $("#loadingImgAnim").remove()
                })
            })
        })
    }
}

function getLabelImg(c, a) {
    if (c) {
        if (currentImg + 1 > maxImg) {
            currentImg = 0
        } else {
            currentImg += 1
        }
    } else {
        if (currentImg - 1 < 0) {
            currentImg = maxImg
        } else {
            currentImg -= 1
        }
    }
    var d = '<div id="loadingImgAnim" style="display:none;">Loading ...</div>';
    var b;
    arrImgW[currentImg] <= 580 ? b = 600 : b = arrImgW[currentImg] + 20;
    if (arrImgH[currentImg] < 250) {
        $("#ViewFullSizeText").hide();
        $("#showFullLabel").removeAttr("href");
        $("#showFullLabel").attr("name", "thumbAnchor");
        $("#imgThumb").attr("title", imgTitleTextBlank)
    } else {
        $("a#showFullLabel1").text("View larger");
        $("a#showFullLabel1").attr("class", "popup showFullLabel1 viewLrg");
        $("#showFullLabel1").click(function() {
            loadFullLabel();
            return false
        });
        $("#showFullLabel").click(function() {
            loadFullLabel();
            return false
        });
        $("#ViewFullSizeText").css("float", "left");
        $("#ViewFullSizeText").show();
        $("#showFullLabel").removeAttr("name");
        $("#showFullLabel1").removeAttr("name");
        $("#showFullLabel").attr("href", thumbImgHREF);
        $("#showFullLabel1").attr("href", thumbImgHREF);
        $("#imgThumb").attr("title", imgTitleText)
    }
    if (a) {
        if ($("#loadingImgAnim").length != 0) {
            $("#loadingImgAnim").remove()
        }
        $(d).insertBefore($("#showFullLabel"));
        $("#imgThumb").attr("src", "/images/ajax-loader-horiz.gif");
        $("#imgThumb").attr("src", imgAkamaiURL + arrThumbImgSrc[currentImg]);
        $("#imgThumb").height(arrThumbImgH[currentImg]).width(arrThumbImgW[currentImg]);
        if (typeof label_alt === "undefined") {
            $("#imgThumb").attr("alt", arrLabelAlt[currentImg])
        }
        $("#loadingImgAnim").slideDown("fast")
    } else {
        $(d).insertBefore($("#imgLabel"));
        $("#imgLabel").attr("src", "/images/ajax-loader-horiz.gif");
        $("#imgLabel").attr("src", imgAkamaiURL + arrImgSrc[currentImg]);
        $("#loadingImgAnim").slideDown("fast");
        $("#imgLabel").height(arrImgH[currentImg]).width(arrImgW[currentImg]);
        $("#imgThumb").attr("src", "/images/ajax-loader-horiz.gif");
        $("#imgThumb").attr("src", imgAkamaiURL + arrThumbImgSrc[currentImg]);
        $("#imgThumb").height(arrThumbImgH[currentImg]).width(arrThumbImgW[currentImg]);
        if (typeof label_alt === "undefined") {
            $("#imgLabel").attr("alt", arrLabelAlt[currentImg]);
            $("#modelHeader").html(arrLabelAlt[currentImg]);
            $("#imgThumb").attr("alt", arrLabelAlt[currentImg])
        }
        $("#url_source_fix").html("");
        $("#url_source_fix").hide()
    }
    $("#img_low_t").text(currentImg + 1);
    $("#img_low").text(currentImg + 1)
}
var imgThumb = $("#imgThumb");
if ($("#imgThumb").length != 0) {
    $(function() {
        $("#imgThumb").load(function() {
            $("#loadingImgAnim").delay(500).slideUp("fast", function() {
                $("#loadingImgAnim").remove()
            })
        })
    })
}
if ($("#nextImg").length != 0) {
    $(function() {
        $("#nextImg").click(function() {
            getLabelImg(true, true);
            return false
        })
    })
}
if ($("#prevImg").length != 0) {
    $(function() {
        $("#prevImg").click(function() {
            getLabelImg(false, true);
            return false
        })
    })
}
if (d_prob_btn == true) {
    $(function() {
        if (typeof String.prototype.trim !== "function") {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/g, "")
            }
        }
        var a = "/report-problem.lml?winename_id_F=" + prob_wine_name_id + "&winename_F=" + prob_wine_name + "&displayname_F=" + prob_display_name + "&vintage_F=" + prob_vintage + "&prob_page_F=" + prob_from_page + "&prob_url_F=" + escape(document.location.href);
        $("#prob-btn").click(function() {
            modalFull = "N";
            if ($("#modalBox").length) {
                $("#modalBox").remove();
                $(".modal-backdrop").remove()
            }
            var f = new classModalBox("modalBox");
            var d = '<div class="form-group"><p>Help us improve the quality of our information. Tell us about any problems on this page.</p></div>';
            d += '<div class="form-group btmargin1">';
            d += '<label class="control-label">Issue: </label>';
            d += '<div class="form-control-wrapper"><textarea id="issue" name="issue" class="form-control" rows="6"></textarea>';
            d += '<div class="txtnote">(Max 500 characters)</div>';
            d += '<div class="help-block errortxt hide" id="issueerror"></div></div>';
            d += "</div>";
            d += '<div class="form-group btmargin2">';
            d += '<label class="control-label">Email: </label>';
            d += '<div class="form-control-wrapper"><input type="text" id="email_address" name="email_address" class="form-control">';
            d += '<div class="help-block errortxt hide" id="emailerror">The email address is invalid.</div></div>';
            d += "</div>";
            f.setAttr({
                header: {
                    show: true,
                    title: "Feedback"
                },
                body: d,
                footer: {
                    show: true,
                    closeButton: {
                        onClick: function() {
                            $("#modalBox").modal("hide")
                        },
                        show: true,
                        label: "Cancel"
                    },
                    okButton: {
                        onClick: function() {
                            var h = false,
                                k = false;
                            var l = $("#issue"),
                                j = $("#email_address");
                            if (l.val().length > 500) {
                                $("#issueerror").html("");
                                $("#issueerror").html("Problem description must be no more than 500 characters. You have typed " + l.val().length + " long.");
                                $("#issueerror").removeClass("hide").addClass("show");
                                l.addClass("form-control-error");
                                h = false
                            } else {
                                if (l.val().trim().length == 0) {
                                    $("#issueerror").html("");
                                    $("#issueerror").html("Problem description cannot be blank; please explain the problem you have encountered.");
                                    $("#issueerror").removeClass("hide").addClass("show");
                                    l.addClass("form-control-error");
                                    h = false
                                } else {
                                    $("#issueerror").removeClass("show").addClass("hide");
                                    l.removeClass("form-control-error");
                                    h = true
                                }
                            }
                            if (j.val().trim().length == 0) {
                                $("#emailerror").html("");
                                $("#emailerror").html("Email address cannot be blank.");
                                $("#emailerror").removeClass("hide").addClass("show");
                                j.addClass("form-control-error");
                                k = false
                            } else {
                                if (j.val().trim().length > 0) {
                                    var g = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
                                    if (j.val().trim().match(g)) {
                                        $("#emailerror").removeClass("show").addClass("hide");
                                        j.removeClass("form-control-error");
                                        k = true
                                    } else {
                                        $("#emailerror").html("");
                                        $("#emailerror").html("Email address is invalid.");
                                        $("#emailerror").removeClass("hide").addClass("show");
                                        j.addClass("form-control-error");
                                        k = false
                                    }
                                }
                            }
                            if (k == true && h == true) {
                                $.ajax({
                                    url: a + "&email_F=" + escape(j.val()) + "&prob_issue_F=" + escape(l.val()),
                                    success: function() {
                                        $("#prob-btn").hide("fast");
                                        $("#report_prob").append('<div class="errortxt">Thanks, problem reported successfully</div>');
                                        setTimeout(function() {
                                            $(".errortxt").hide("slow")
                                        }, 5000);
                                        $("#modalBox").modal("hide")
                                    },
                                    error: function() {
                                        $("#prob-btn").hide("fast");
                                        $("#report_prob").append('<div class="errortxt">Sorry, an error occurred reporting the problem. Please <A HREF="/contact-general.lml?contact_return_F=' + escape(document.location.href) + '">contact us</a>.</div>');
                                        $("#modalBox").modal("hide")
                                    }
                                })
                            }
                        },
                        show: true,
                        label: "Submit"
                    }
                }
            });
            $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $("html") : $("body")) : $("html,body");
            $body.stop().animate({
                scrollTop: 0
            }, 800);
            $("#modalBox").modal();
            detectedBrowser = getBrowser();
            getBrowserInfo(detectedBrowser);
            if (detectedBrowserName === "msie" && detectedBrowserVersion < 9) {
                var c = $(window).width() / 2 - 210;
                var b = $(window).height() / 2 - 250;
                c = c + "px";
                b = b + "px";
                $("#modalBox").css({
                    width: "420px",
                    top: b,
                    left: c
                })
            }
            $("#modalBox").on("shown", function() {
                $("#issue").focus()
            });
            $("#modalBox").on("hidden", function() {
                $("#modalBox").remove();
                $(".modal-backdrop").remove();
                $("body").removeClass("modal-open")
            })
        })
    })
}
if (typeof(wowserXurl) != "undefined") {
    wowserRecommendations(wowserXurl)
}
if (typeof(drawTrueBottleChartYN) == "undefined") {
    var drawTrueBottleChartYN
}
if (typeof(drawchartYN) == "undefined") {
    var drawchartYN
}(function(a, f, c) {
    function b() {
        if (drawTrueBottleChartYN) {
            drawTrueBottleChart()
        }
        if (drawchartYN) {
            b()
        }
    }
    if (a.addEventListener) {
        a.addEventListener("load", b, false)
    } else {
        if (a.attachEvent) {
            a.attachEvent("onload", b)
        }
    }
})(window, document, "script");
var winWidth = $(window).width();
var winHeight = $(window).height();
if (typeof prcHistChartHeight == "undefined") {
    var prcHistChartHeight = 300
}
if (typeof drawchartdetailpageYN === "undefined") {
    drawchartdetailpageYN = false
}
if (drawchartdetailpageYN) {
    try {
        drawFullChart("hst_price_div_detail_page", true, prcHistChartHeight);
        $(window).resize(function() {
            var b = $(window).width();
            var a = $(window).height();
            if (winWidth != b || winHeight != a) {
                resetDetailPriceChartDimensions()
            }
            winWidth = b;
            winHeight = a
        })
    } catch (e) {}
}
JSONscriptRequest.scriptCounter = 1;
JSONscriptRequest.prototype.buildScriptTag = function() {
    this.scriptObj = document.createElement("script");
    this.scriptObj.setAttribute("type", "text/javascript");
    this.scriptObj.setAttribute("src", this.fullUrl);
    this.scriptObj.setAttribute("id", this.scriptId)
};
JSONscriptRequest.prototype.removeScriptTag = function() {
    this.headLoc.removeChild(this.scriptObj)
};
JSONscriptRequest.prototype.addScriptTag = function() {
    this.headLoc.appendChild(this.scriptObj)
};
var option_region;
var m_region;
var infowindow_region;
var bounds_region;
var option_country;
var m_country;
var infowindow_country;
var bounds_country;
$(function() {
    var a = $.cookie("vtglist_expand_yn");
    if (a == "y" && !$("#vtg_list_arrow").hasClass("icon-collapse")) {
        c()
    }
    $("#vtg_list_a,#VtgHeader").click(function() {
        if ($("#vtg_list_arrow").hasClass("icon-collapse")) {
            b()
        } else {
            c()
        }
        return false
    });

    function b() {
        $("#vintscroll").css("height", "70px");
        $("#scroll_table_container").css("position", "absolute");
        if (typeof schpvfull != "undefined" && schpvfull == "Y") {
            $("#scroll_table").css("width", "728px")
        } else {
            $("#scroll_table").css("width", "620px")
        }
        $("#vtg_list_arrow").removeClass("icon-collapse").addClass("icon-expand");
        $("#VtgHeader").removeClass("vtg-header-collapsed").addClass("vtg-header");
        $("#vtg_list_a").attr("title", "Show full list");
        $("#vtg_list_show_all").text("Show all");
        $.cookie("vtglist_expand_yn", "n", {
            path: "/"
        })
    }

    function c() {
        $("#vintscroll").css("height", "100%");
        $("#scroll_table_container").css("position", "static");
        if (typeof schpvfull != "undefined" && schpvfull == "Y") {
            $("#scroll_table").css("width", "748px")
        } else {
            $("#scroll_table").css("width", "640px")
        }
        $("#vtg_list_arrow").removeClass("icon-expand").addClass("icon-collapse");
        $("#VtgHeader").removeClass("vtg-header").addClass("vtg-header-collapsed");
        $("#vtg_list_a").attr("title", "Show short list");
        $("#vtg_list_show_all").text("Show less");
        $.cookie("vtglist_expand_yn", "y", {
            path: "/"
        })
    }
});
(function(b) {
    function a(g) {
        var l = g || window.event,
            j = [].slice.call(arguments, 1),
            f = 0,
            h = true,
            k = 0,
            d = 0;
        g = b.event.fix(l);
        g.type = "mousewheel";
        if (g.wheelDelta) {
            f = g.wheelDelta / 120
        }
        if (g.detail) {
            f = -g.detail / 3
        }
        d = f;
        if (l.axis !== undefined && l.axis === l.HORIZONTAL_AXIS) {
            d = 0;
            k = -1 * f
        }
        if (l.wheelDeltaY !== undefined) {
            d = l.wheelDeltaY / 120
        }
        if (l.wheelDeltaX !== undefined) {
            k = -1 * l.wheelDeltaX / 120
        }
        j.unshift(g, f, k, d);
        return b.event.handle.apply(this, j)
    }
    var c = ["DOMMouseScroll", "mousewheel"];
    b.event.special.mousewheel = {
        setup: function() {
            if (this.addEventListener) {
                for (var d = c.length; d;) {
                    this.addEventListener(c[--d], a, false)
                }
            } else {
                this.onmousewheel = a
            }
        },
        teardown: function() {
            if (this.removeEventListener) {
                for (var d = c.length; d;) {
                    this.removeEventListener(c[--d], a, false)
                }
            } else {
                this.onmousewheel = null
            }
        }
    };
    b.fn.extend({
        mousewheel: function(d) {
            return d ? this.bind("mousewheel", d) : this.trigger("mousewheel")
        },
        unmousewheel: function(d) {
            return this.unbind("mousewheel", d)
        }
    })
})(jQuery);
$(document).ready(function() {
    if (typeof focus_field_name != "undefined") {
        $('input[name="' + focus_field_name + '"]').focus()
    }
});

function constructFind() {
    var f = std_url;
    var T;
    if ($("#winename").val() != "") {
        T = $("#winename").val().toLowerCase()
    } else {
        T = $("#Xwinename").val().toLowerCase()
    }
    var N = $("#winenamedisplay").val();
    var B = 0;
    if (N.toLowerCase() === T.toLowerCase()) {
        var B = 1
    }
    var k = $("#Xvintage").val().toLowerCase();
    var b = $("#Xvintage").val().toLowerCase();
    var s = "";
    var t = "";
    if (typeof($("#Xlocation").val()) != "undefined") {
        s = $("#Xlocation").val().toLowerCase()
    }
    if (typeof($("input:radio[name ='Xkeyword_mode1']:checked").val()) != "undefined") {
        t = $("input:radio[name ='Xkeyword_mode1']:checked").val().toLowerCase();
        if (t == "aut") {
            t = "a"
        }
    } else {
        if (typeof($("input:radio[name ='Xkeyword_mode']:checked").val()) != "undefined") {
            t = $("input:radio[name ='Xkeyword_mode']:checked").val().toLowerCase()
        }
    }
    var p = $("#Xwinenameid").val();
    var J = "";
    var O = "";
    var K = "";
    var r = "";
    var H = "";
    var w = "";
    var y;
    var F = new Date();
    var z;
    var g = "";
    var A = "";
    var U = "";
    var V = "";
    var m = "";
    if (document.getElementById("show_favourite") != null) {
        m = document.getElementById("show_favourite").value
    }
    var G = " " + T.toLowerCase() + " ";
    G = G.replace(/\+/g, " ");
    G = G.replace(/'s[,.!;-] /g, "s ");
    G = G.replace(/'s[)(":\/] /g, "s ");
    G = G.replace(/'s /g, "s ");
    G = G.replace(/ï¿½s /g, "s ");
    G = G.replace(/ï¿½s /g, "s ");
    G = G.replace(/\u2019s /g, "s ");
    G = G.replace(/`s /g, "s ");
    var q = String.fromCharCode(269) + "ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½/_,:;ï¿½'";
    var q = "\u010d\u00e0\u00e1\u00e4\u00e2\u00e5\u00e3\u00e8\u00e9\u00eb\u00ea\u00ec\u00ed\u00ef\u00ee\u00f2\u00f3\u00f6\u00f4\u00f8\u00f5\u00f9\u00fa\u00fc\u00fb\u00f1\u00e7\u2019\u00df\u00fd\u00ff\u017e\u00b7\u002f\u005f\u002c\u003a\u003b\u2013\u0027";
    var S = "caaaaaaeeeeiiiioooooouuuuncssyyz        ";
    G = G.replace(/ï¿½/g, "ae");
    G = G.replace(/\./g, " ");
    for (var M = 0, I = q.length; M < I; M++) {
        G = G.replace(new RegExp(q.charAt(M), "g"), S.charAt(M))
    }
    if (typeof String.prototype.trim !== "function") {
        T = G.replace(/^\s+|\s+$/g, "")
    } else {
        T = G.trim()
    }
    var u = "";
    for (var M = 1; M <= T.length; M++) {
        var Q = T.substr(M - 1, 1);
        if (Q == String.fromCharCode(38) || Q == "/" || Q == "?" || Q == "=" || Q == "%" || Q == ",") {
            u = u + " "
        } else {
            u = u + Q
        }
    }
    u = u.replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "+").replace(/-+/g, "-");
    T = u;
    if (k.length > 4) {
        b = "1"
    } else {
        var D = F.getFullYear();
        var d = Math.floor(F.getFullYear() / 100) * 100;
        var C = F.getFullYear() - d;
        var v = "";
        z = "Y";
        for (var M = 1; M <= k.length; M++) {
            var Q = k.substr(M - 1, 1);
            if ((Q >= "0" && Q <= "9") || Q == "n" || Q == "v" || Q == "a" || Q == "l") {
                v = v + Q;
                if (Q == "n" || Q == "v" || Q == "a" || Q == "l") {
                    z = "N"
                }
            }
        }
        if (v == "") {
            b = 1
        } else {
            if (v == "NV" || v == "nv") {
                b = 0
            } else {
                if (v == "ALL" || v == "all") {
                    b = 1
                } else {
                    if (v == "N" || v == "n") {
                        b = 1
                    } else {
                        if (v == "0" || v == "1" || v == "2") {
                            b = v
                        } else {
                            if (parseInt(v) > C && parseInt(v) < 100) {
                                b = parseInt(v) + (d - 100)
                            } else {
                                if (parseInt(v) >= 0 && parseInt(v) <= C) {
                                    b = parseInt(v) + (d)
                                } else {
                                    if (parseInt(v) > 99 && (parseInt(v) < 1699 || parseInt(v) > D)) {
                                        b = 1
                                    } else {
                                        b = v
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    for (var R = 1; R <= 3; R++) {
        for (var M = 1; M <= T.length - 4; M++) {
            var z = "Y";
            for (var L = 1; L <= T.length - M + 1; L++) {
                var Q = T.substr(M + L - 2, 1);
                if (Q >= "0" && Q <= "9") {
                    z = "Y"
                } else {
                    z = "N";
                    break
                }
            }
            if (L > 5 || z == "Y") {
                if (M == 1 && z == "Y") {
                    T = ""
                } else {
                    if (M == 1) {
                        T = T.substr(M + L - 2)
                    } else {
                        if (z == "Y") {
                            T = T.substr(0, M - 1)
                        } else {
                            T = T.substr(0, M - 1) + T.substr(M + L - 2)
                        }
                    }
                }
                break
            }
        }
    }
    T = T.replace(" ", " ");
    if (T.substr(0, 1) == " " || T.substr(0, 1) == "+") {
        T = T.substr(1)
    }
    if (T.substr(T.length - 1, 1) == " " || T.substr(T.length - 1, 1) == "+") {
        T = T.substr(0, T.length - 1)
    }
    if (B === 0) {
        saveWinesData(T.replace(/\+/g, " "), N)
    } else {
        if (B === 1) {
            saveWinesData(T.replace(/\+/g, " "), T.replace(/\+/g, " "))
        }
    }
    if (s == "ANY" || s == "any") {
        s = "-"
    }
    y = s;
    if (s == "usa") {
        U = $("#Xstateid").val();
        if (U == "ANY" || U == "ZC") {
            U = ""
        }
        V = "";
        if (document.searchform.Xshipto.checked == true) {
            V = "y"
        } else {
            V = ""
        }
        if (U == "R." || U == "ANY" || U == "") {
            V = ""
        }
        var x = $("#Xzipcode").val();
        var E = "";
        for (var M = 1; M <= x.length; M++) {
            var Q = x.substr(M - 1, 1);
            if (Q >= "0" && Q <= "9") {
                E = E + Q
            }
        }
        A = E;
        if (A != "") {
            U = "";
            V = "";
            g = document.searchform.Xzipmiles.options[document.searchform.Xzipmiles.selectedIndex].value;
            var o = "";
            for (var M = 1; M <= g.length; M++) {
                var Q = g.substr(M - 1, 1);
                if (Q >= "0" && Q <= "9") {
                    o = o + Q
                }
            }
            g = o
        } else {
            g = ""
        }
        var P = s;
        if (A > 0) {
            if (g > 0) {
                P = s + "-" + A + "-" + g
            } else {
                P = s + "-" + A
            }
        } else {
            if (U != "" && typeof U != "undefined" && U != "ALL" && U != "ANY" && U != "ZC") {
                if (V == "y") {
                    P = s + "-" + U + "-" + V
                } else {
                    P = s + "-" + U
                }
            }
        }
        y = P
    } else {
        U = "";
        V = "";
        A = "";
        g = "";
        P = ""
    }
    if (typeof document.searchform.Xbottle_size != "undefined") {
        O = document.searchform.Xbottle_size.options[document.searchform.Xbottle_size.selectedIndex].value
    }
    if (typeof $("#Xprice_min").val() != "undefined") {
        r = $("#Xprice_min").val()
    }
    if (typeof $("#Xprice_max").val() != "undefined") {
        H = $("#Xprice_max").val()
    }
    if (typeof document.searchform.Xprice_set != "undefined") {
        K = document.searchform.Xprice_set.options[document.searchform.Xprice_set.selectedIndex].value
    }
    var h = "N";
    for (var M = 1; M <= A.length; M++) {
        var Q = A.substr(M - 1, 1);
        if (Q > "9" || Q < "0") {
            h = "Y"
        }
    }
    if (h == "Y" || A.length != 5) {
        A = "";
        g = ""
    } else {
        var n = "N";
        for (var M = 1; M <= g.length; M++) {
            var Q = g.substr(M - 1, 1)
        }
        if (Q > "9" || Q < "0") {
            n = "Y"
        }
        if (n == "Y") {
            g = ""
        }
    }
    if (O != "all" && O != "Bottle" && O != "Half Bottle" && O != "H/Bottle (375ml)" && O != "Magnum" && O != "D-magnum (3L)" && O != "Case" && O != "other") {
        O = ""
    }
    if (K != "CUR" && K != "M01" && K != "M02" && K != "M03" && K != "Y01" && K != "Y02" && K != "Y03" && K != "Y04") {
        K = ""
    }
    if (T === "") {
        T = "-"
    }
    if (b === "") {
        b = "1"
    }
    if (typeof s == "undefined" || s == "") {
        s = "-"
    }
    if (typeof t == "undefined" || t == "" || t == "a") {
        t = "-"
    }
    if (O != "" || K != "" || r != "" || H != "" || m != "") {
        w = "?Xlist_format=" + J + "&Xbottle_size=" + O + "&Xprice_set=" + K + "&Xprice_min=" + r + "&Xprice_max=" + H + "&Xshow_favourite=" + m
    } else {
        w = ""
    }
    if (typeof p == "undefined" || p == "" || p == 0) {
        if (t == "-") {
            if (s == "-") {
                if (b == "1") {
                    f = std_url + "find/" + escape(T).replace(/%20/g, "+") + w
                } else {
                    f = std_url + "find/" + escape(T).replace(/%20/g, "+") + "/" + b + w
                }
            } else {
                f = std_url + "find/" + escape(T).replace(/%20/g, "+") + "/" + b + "/" + escape(y).replace(/%20/g, "+").toLowerCase() + w
            }
        } else {
            f = std_url + "find/" + escape(T).replace(/%20/g, "+") + "/" + b + "/" + escape(y).replace(/%20/g, "+").toLowerCase() + "/-/" + t + w
        }
    } else {
        f = std_url + "find/" + escape(T).replace(/%20/g, "+") + "/" + b + "/" + escape(y).replace(/%20/g, "+").toLowerCase() + "/-/" + t + "/-/" + p + w
    }
    return f
}
$(document).ready(function() {
    if (typeof(moreMenus) !== "undefined" && typeof(promptExpand) !== "undefined" && typeof(promptCollapse) !== "undefined" && typeof(toggleBtnId) !== "undefined") {
        if ($(toggleBtnId).length) {
            $(toggleBtnId).click(function() {
                if ($(moreMenus).css("display") == "none") {
                    $(toggleBtnId).html(promptCollapse);
                    $(moreMenus).show()
                } else {
                    $(toggleBtnId).html(promptExpand);
                    $(moreMenus).hide();
                    if (typeof(anchorElemId) !== "undefined") {
                        $("html, body").animate({
                            scrollTop: $(anchorElemId).offset().top - $(window).height() + Math.round($(window).height() * 0.1)
                        }, "slow")
                    }
                }
            })
        }
    }
});
$(document).ready(function() {
    if ($("#cse").length && $("#showTastingNote").length) {
        $("#showTastingNote").click(function() {
            google.load("search", "1", {
                language: "en",
                callback: function() {
                    var b = {};
                    b.adoptions = {
                        layout: "noTop"
                    };
                    var c = new google.search.CustomSearchControl("018148841331049500731:_q29wijfex8", b);
                    c.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
                    var a = new google.search.DrawOptions();
                    a.enableSearchResultsOnly();
                    c.draw("cse", a);
                    c.execute(squery.wn);
                    if ($("#cse").hasClass("hide")) {
                        $("#showTastingNote").html("Hide");
                        $("#cse").removeClass("hide").addClass("show")
                    } else {
                        $("#showTastingNote").html("View");
                        $("#cse").removeClass("show").addClass("hide")
                    }
                }
            })
        })
    }
});
$(document).ready(function() {
    $("div.show-more-js").click(function(b) {
        b.preventDefault();
        var a = $(this).attr("id");
        if ($("div#" + a).length && (a == "showProducerMore" || a == "showVtgMore")) {
            if (a == "showProducerMore") {
                if ($(".wnlist .more-link").hasClass("hide")) {
                    $(".wnlist .more-link").removeClass("hide").addClass("show");
                    $("div#" + a + " span").removeClass("chevron-down").addClass("chevron-up")
                } else {
                    $(".wnlist .more-link").removeClass("show").addClass("hide");
                    $("div#" + a + " span").removeClass("chevron-up").addClass("chevron-down")
                }
            } else {
                if (a == "showVtgMore") {
                    if ($(".vtglist .more-link").hasClass("hide")) {
                        $(".vtglist .more-link").removeClass("hide").addClass("show");
                        $("div#" + a + " span").removeClass("chevron-down").addClass("chevron-up")
                    } else {
                        $(".vtglist .more-link").removeClass("show").addClass("hide");
                        $("div#" + a + " span").removeClass("chevron-up").addClass("chevron-down")
                    }
                }
            }
        } else {
            if ($("div#" + a + "Content").length && $("div#" + a).length) {
                if ($("div#" + a + "Content").hasClass("hide")) {
                    $("div#" + a + "Content").removeClass("hide").addClass("show");
                    $("div#" + a + " span").removeClass("chevron-down").addClass("chevron-up")
                } else {
                    $("div#" + a + "Content").removeClass("show").addClass("hide");
                    $("div#" + a + " span").removeClass("chevron-up").addClass("chevron-down")
                }
            }
        }
    })
});
$(document).ready(function() {
    $("a.fg-item-js").click(function(b) {
        b.preventDefault();
        $(this).toggleClass("opened");
        var a = $(this).attr("id");
        if ($(this).hasClass("opened")) {
            $("a#" + a + " span").removeClass("droparrow-down2").addClass("droparrow-up2");
            $("ul." + a).addClass("show").removeClass("hide")
        } else {
            $("a#" + a + " span").removeClass("droparrow-up2").addClass("droparrow-down2");
            $("ul." + a).addClass("hide").removeClass("show")
        }
    });
    $("span.seller-link-js").click(function(b) {
        $(this).toggleClass("opened");
        var a = $(this).parent().attr("id");
        if ($(this).hasClass("opened")) {
            $(this).removeClass("chevron-bs-down").addClass("chevron-bs-up");
            $(this).prop("title", "Less information about this seller");
            $("div." + a).addClass("show").removeClass("hide")
        } else {
            $(this).removeClass("chevron-bs-up").addClass("chevron-bs-down");
            $("div." + a).addClass("hide").removeClass("show");
            $(this).prop("title", "More information about this seller")
        }
    });
    $("span#seller-master-js").click(function(a) {
        $(this).toggleClass("opened");
        if ($(this).hasClass("opened")) {
            $(this).removeClass("chevron-down").addClass("chevron-up");
            $(this).prop("title", "Less information about sellers");
            var b = $("div.offers-table").find("span.chevron-bs-down");
            b.each(function(c, f) {
                var d = $(f);
                if (d.not(".opened")) {
                    d.addClass("opened");
                    d.removeClass("chevron-bs-down").addClass("chevron-bs-up");
                    d.prop("title", "Less information about this seller");
                    $("div.offers-table").find("div.seller-info-js").addClass("show").removeClass("hide")
                }
            })
        } else {
            $(this).removeClass("chevron-up").addClass("chevron-down");
            $(this).prop("title", "More information about sellers");
            var b = $("div.offers-table").find("span.chevron-bs-up");
            b.each(function(c, f) {
                var d = $(f);
                if (d.hasClass("opened")) {
                    d.removeClass("opened");
                    d.removeClass("chevron-bs-up").addClass("chevron-bs-down");
                    d.prop("title", "More information about this seller");
                    $("div.offers-table").find("div.seller-info-js").addClass("hide").removeClass("show")
                }
            })
        }
    })
});
var originalLeave = $.fn.popover.Constructor.prototype.leave;
$.fn.popover.Constructor.prototype.leave = function(d) {
    var b = d instanceof this.constructor ? d : $(d.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
    var a, c;
    originalLeave.call(this, d);
    if (d.currentTarget) {
        a = $(d.currentTarget).siblings(".popover");
        c = b.timeout;
        a.one("mouseenter", function() {
            clearTimeout(c);
            a.one("mouseleave", function() {
                $.fn.popover.Constructor.prototype.leave.call(b, b)
            })
        })
    }
};
$("body").popover({
    selector: "[data-popover]",
    trigger: "click hover",
    placement: "auto",
    delay: {
        show: 50,
        hide: 400
    }
});

function kjunf() {
    var f = new Date();
    var b = document.createElement("script");
    b.async = true;
    b.type = "text/javascript";
    var c = "https:" == document.location.protocol;
    b.src = "/ajax/bds.js?t=" + _qt + "&s=" + _qs + "&dt=" + f.toUTCString();
    var a = document.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(b, a)
}
$(document).ready(function() {
    kjunf();
    goAlexa()
});

function saveWinesData(j, d) {
    if (typeof(browserStorageSupport) != "undefined" && browserStorageSupport == true) {
        try {
            if (typeof(JSON.parse(localStorage.getItem("wswinesdata"))) !== undefined && JSON.parse(localStorage.getItem("wswinesdata")) !== null) {
                var a = JSON.parse(localStorage.getItem("wswinesdata")) || [];
                if (a.length > 0) {
                    for (var f = 0; f < a.length; f++) {
                        var b = a[f].w;
                        var l = a[f].swd;
                        if ((b.toLowerCase() === j.toLowerCase()) || (l.toLowerCase() === j.toLowerCase())) {
                            a.splice(f, 1);
                            break
                        }
                    }
                    localStorage.wswinesdata = JSON.stringify(a);
                    var c = new Object();
                    c.swd = d;
                    c.w = j;
                    a.unshift(c);
                    localStorage.wswinesdata = JSON.stringify(a);
                    localStorage.setItem("wswinesdata", JSON.stringify(a))
                }
            } else {
                var a = [];
                var c = new Object();
                c.swd = d;
                c.w = j;
                a.unshift(c);
                localStorage.setItem("wswinesdata", JSON.stringify(a))
            }
        } catch (h) {
            if (h.name.toUpperCase().indexOf("QUOTA") >= 0) {
                console.log("Sorry, your browser local storage limit exceeds, please free some storage space.")
            } else {
                var g = new RegExp("wswinesdata");
                if (localStorage.length > 0) {
                    for (var k in localStorage) {
                        if (g.test(k) == true) {
                            localStorage.removeItem(k);
                            try {
                                var a = [];
                                var c = new Object();
                                c.swd = d;
                                c.w = j;
                                a.unshift(c);
                                localStorage.setItem("wswinesdata", JSON.stringify(a))
                            } catch (h) {}
                        }
                    }
                }
                console.log("There is something wrong with local storage data, please try again.")
            }
        }
    }
};