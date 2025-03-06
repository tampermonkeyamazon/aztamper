1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25
// ==UserScript==
// @name         Shift Metrics - aakalish
// @namespace    pulls data from all over to quickly see ship dock metrics and deep
dive
// @version      11.4
// @description  pulls data from all over to quickly see ship dock metrics and deep 
dive
// @author       aakalish
// @match        https://trans-logistics.amazon.com/shiftMetrics
// @match        https://trans-logistics-eu.amazon.com/shiftMetrics
// @match        https://trans-logistics.amazon.com/yms/shipclerk/*
// @match        https://trans-logistics-eu.amazon.com/yms/shipclerk/*
// @downloadURL  
https://axzile.corp.amazon.com/-/carthamus/download_script/shift-metrics.user.js
// @updateURL    
https://axzile.corp.amazon.com/-/carthamus/download_script/shift-metrics.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @connect      monitorportal.amazon.com
// @connect      apollo-audit.corp.amazon.com
// @connect      us-east-1.svs.scarta.sorttech.amazon.dev
// @connect      atlas.corp.amazon.com
// @connect      fclm-portal.amazon.com
// @connect      ii51s3lexd.execute-api.us-east-1.amazonaws.com
// @connect      jwmjkz3dsd.execute-api.eu-west-1.amazonaws.com
// @connect      mercury-webserver-na-iad.iad.proxy.amazon.com
// @connect      mercury-webserver-eu-dub.dub.proxy.amazon.com
// @connect      americas.roboscout.rom.robotics.a2z.com
// @connect      emea.roboscout.rom.robotics.a2z.com
// @connect      sort.aka.amazon.com
// @connect      sort-eu.aka.amazon.com
// @connect      axzile.corp.amazon.com
// @connect      midway-auth.amazon.com
// @connect      ont-base.corp.amazon.com
// @connect      idp.federate.amazon.com
// @connect      atlas.qubit.amazon.dev
// @connect      api.na.vast.ops-integration.amazon.dev
// @connect      api.eu.vast.ops-integration.amazon.dev
// @connect      vinyaas-ui-eu.amazon.com
// @connect      vinyaas-ui-na.amazon.com
// ==/UserScript==
// v1.0 initial script
// v1.0-1.10 slight modifications
// v2.0 added fill rate and dashboard info
// v2.1 made fill rate reflect closer to quicksite
// v2.2-2.4 rolling out to network. working on edge cases
// v3.0 added Cart On non-cart lane
// v4.0 added AR recirc
// v4.1 - v5.0
// 4.1 changed some logic to make sure LIQ and Trans is ignored in CNS
// 4.1 staging ignores trans as well
// 4.2 catch unauthorized Ar recirc error. load roboscout and then tries again once
// 4.3 bug with create by barcode %
// 4.4 bug with cart on non-cart with things ending with cart fixed
// 4.5 doing 4.4 fully lol
// 4.6 sort CNS by packages
// 4.7 added SDT to fill rate dd
// 4.8 checked if contents is > 1 for containers not created to get rid of anything 
that the conatiner was created a long time ago. adds small amount of risk with 1 
package not accounted for, but cleans up the metric a lot.
// 4.9 added fclm time details on click
// 4.91 :why: accidentally called Month, not getMonth....
// 5.0 added Yard stuff and selector
// 5.02 added TDR time to lates
// 5.03 added cross check for CNS
// 5.04 changed scan compliance to scan performance
// 5.05 added more robin stuff. actually allowed people to view FS recirc lol
// 5.06 no yellow tagged go cart trailers nice!
// 5.07 no same day in fill rate i guess
// 5.08 fill rate includes miss-sorts lol. got rid of any UPS trailer its tied to
// 5.09 actual right failed moves DPMO
// 5.10 remove DON closed not staged
// 5.11 added sorting for deepdive table except for overdues
// 5.12 kinda sorta made it work for EU
// 5.13 added empty AZNGs
// 5.14 added DCM things
// 5.15 actually made the DCM things right lol
// 5.16 closed not staged ignoring cases
// 5.17 updating for DCA1
// 5.18 updating for DCA1 again
// 5.19 updated tt check for closed not staged and failed container moves to fix 
some things not popping
// 6.0 added apollo audits
// 6.1 added TDR late
// 6.2 made apollo audits hopefully load better.
// 6.3 added info stuff
// 6.4 added volume
// 6.5 updating for LCY3
// 6.7 added @connects to try to fix random peoples things not working
// 6.8 added containers not created remove of duplicate chutes
// 7.0 added sdt < cpt-1h then show on fill rate
// 7.3 atlas -> atlas 2.0
// 7.4 fixed auth with atlas 2.0
// 7.5 presets
// 7.7 added apollo lane captain audits
// 7.8 I did.... something
// 7.9 fixed roboscout data source location.
// 8.0 added igraphs for DCM
// 8.2 fixed bug where igraph didnt show if no deep dive was found for DCM. 
changed late trailers to CPT, not SDT. and added location to CNS
// 8.3 added VAST
// 8.4 changed to all adhocs scheduled over 1 hour after CPT are considered late
// 8.5 added fix by date on VAST
// 8.7 revamped overdues drilldowns and got rid of undefined
// 8.8 fixed refresh bug with overdues.
// 8.9 added today button. fixed bug with no stacking filter in overdues.
// 9.0 added no deep dive click so igraphs can load
// 9.1 & 9.2 added at risk CNC and added errors for VAST causing impact to ICT2
// 9.4 added descriptions for MEP/DEP/Robin %, fixed bug with typing in building 
code in lower case and just errored out VAST if it does the bug and only pulls one 
of the metrics
// 9.5 added directed staffing to plan
// 9.6 upgraded VAST dd
// 9.7 fixed VAST metric......
// 9.8 changed CBB and inverse to be by cloud, not stacking filter improving 
accuracy.
// 9.9 had to change my home country's recirc igraph
// 10.0 changed directed %'s to ignore breaks for AF sites.
// 10.1 fixed directed %'s
// 10.2 home country's recirc again.
// 10.4 changed yms security token grab, looks way better in terms of being 
consistent
// 10.5 YMS was slowed due to some CSS stuff. I'm going to be honest, I just found 
the script online and didn't know the person who made it liked slowing down every
computer that ran it.
// 10.6 Palletize changed functions in FCLM
// 10.7 tried to fix induct rates as well.
// 10.9 added date and number sorting for the dd table
// 11.0 added sym cart for Cbb
// 11.1 directed staffing to CX recommended
// 11.2 removed hard coding of stations for AR docks.
// 11.3 added VRET volume
// 11.4 fixed cog for cbb where CONT lanes are referred to CART on x-dock filters.
(function() {
    'use strict';
    if (document.URL.split('shiftMetrics').length > 1 )
    {
        GM_addStyle(`.gg-info {
    box-sizing: border-box;
    position: relative;
    display: block;
    transform: scale(var(--ggs,1));
    width: 20px;
    height: 20px;
    border: 2px solid;
    border-radius: 40px
}
.gg-info::after,
.gg-info::before {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
    border-radius: 3px;
    width: 2px;
    background: currentColor;
    left: 7px
}
.gg-info::after {
    bottom: 2px;
    height: 8px
}
.gg-info::before {
    height: 2px;
    top: 2px
}`);
        // try to force update
        if( !unsafeWindow.localStorage.getItem('smVersionCheck') || 
JSON.parse(unsafeWindow.localStorage.getItem('smVersionCheck')) < new Date() 
- 24*60*60*1000 )
        {
            unsafeWindow.localStorage.setItem('smVersionCheck', JSON.stringify(new 
Date().getTime()) );
            GM_xmlhttpRequest({
                method: "GET",
                url: 'https://axzile.corp.amazon.com/-/carthamus/download_script/shift-
metrics.user.js',
                onload: function (response) {
                    let script = response.responseText.split('@version')[1].split('\r')
[0].trim()
                    if (script !== '11.4') //remember to change this
                    {
                        
window.open('https://axzile.corp.amazon.com/-/carthamus/download_script/shift-
metrics.user.js', '_blank')
                    };
                }
            });
        };
        var ttThrottle = 0;
        GM_addStyle(`
* {
  transition: all .2s ease;
}
#removeMe {
  text-align: center;
  margin-top: 20px;
}
#removeMe label { color: white; }
.extra-info {
  display: none;
  line-height: 30px;
  font-size: 12px;
  color: black;
}
.red { background: #FFCCCB; }
.info:hover .extra-info {
  display: block;
}
.info {
  font-size: 20px;
  padding-left: 5px;
  width: 20px;
  border-radius: 15px;
}
.info:hover {
  background-color: white;
  padding: 0 0 0 5px;
  width: 315px;
  text-align: left !important;
}`);
        var country = {
            country: 'na'
            ,roboscout: {na:'americas', eu: 'emea'}
            ,translog: {na: '', eu: '-eu'}
            ,mercury: {na: 'na-iad.iad', eu: 'eu-dub.dub'}
            ,yms: {na:'ii51s3lexd.execute-api.us-east-1.amazonaws.com', 
eu:'jwmjkz3dsd.execute-api.eu-west-1.amazonaws.com'}
            ,legship: {na:'AMTRAN', eu:''}
            ,cube: {na:1, eu:0.0610237}
            ,dcm: {na: 'us-east-1', eu:''}
            ,vast: {na: 'na' , eu: 'eu'}
            ,vin: {na: 'na' , eu: 'eu'}
            ,get: function (type) {
                return this[type][this.country];
            }
        }
        country.country = document.URL.split('eu').length > 1? 'eu' : 'na';
        let tanteiToken = '';
        let ymsToken = '';
        let apolloFail = true;
        let stacked = {};
        var tried = true;
        let preset = {};
        let metrics = { metrics: {}, deepDive: {} , deepDive2: {}, addDeepDive: 
function(obj,key) { this.deepDive[key] = obj;} };
        let tempForCNC = {};
        let oddd = ['loc_type', 'cpt', 'sf', 'prnt'];
        if (!!unsafeWindow.localStorage.getItem('oddd'))
        {
            oddd = JSON.parse(unsafeWindow.localStorage.getItem('oddd'));
        };
        let loc = {
            raw: null
            ,data: { value : 0}
            ,add: function(data) {
                if (data.containerType == 'PACKAGE' && (data.locationType !== 
'DOCK_DOOR' || data.locationType !== 'YARD'))
                {
                    let pkg = {
                        sub : (!data.stackingFilter ? '-' : data.stackingFilter.replace('-
FLATS', '').replace('-VCRI','').replace('-SPG','').replace('-CARTON','') )
                        , status : data.status
                        , cpt : data.scheduleDepartureTime
                        , sf : (!data.stackingFilter ? '-' : data.stackingFilter)
                        , loc : data.locationLabel
                        , prnt : data.parentContainerLabel
                        , loc_type : data.locationType
                    };
                    this.data.value++;
                    yep( this.data, pkg[oddd[0]]);
                    if(oddd[1] !== '' )
                    {
                        yep( this.data[pkg[oddd[0]]], pkg[oddd[1]]);
                        if(oddd[2] !== '' )
                        {
                            yep( this.data[pkg[oddd[0]]][pkg[oddd[1]]], pkg[oddd[2]]);
                            if(oddd[3] !== '' )
                            {
                                yep( this.data[pkg[oddd[0]]][pkg[oddd[1]]][pkg[oddd[2]]], 
pkg[oddd[3]]);
                            };
                        };
                    };
                };
                function yep (obj, key)
                {
                    if(obj.hasOwnProperty(key) )
                    {
                        obj[key].value++;
                    } else {
                        obj[key] = { value: 1 }
                    };
                };
            }
        };
        let igraph = {
            getIgraphLink: function(building,type,metric) {
                return igraph[building][type][metric]();
            }
            , checkForExtraDD: function(metricName) {
                if (igraph.hasOwnProperty(metricName) )
                {
                    return igraph[metricName]();
                }
                else
                {
                    return '';
                }
            }
            , BDL2: {
                metric: {
                    "SS Recirc": function() {return 
'https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=BDL2-
ShippingSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Wareh
ouseControlService&MethodName1=SortationOrchestrator.divert&Client1=ALL&
MetricClass1=NONE&Instance1=NONE&Metric1=RECIRC&Period1=OneMinute
&Stat1=n&Label1=Service n&SchemaName2=Search&Pattern2=BDL2-
ShippingSorterController Time SortationOrchestrator.scan 
schemaname%3DService metric%3D%24Time%24&TZTZ=' + 
Intl.DateTimeFormat().resolvedOptions().timeZone +'&StartTime1=' + 
links.start.toISOString() + '&EndTime1='  + links.end.toISOString() + 
'&FunctionExpression1=SUM%28M1%29%2F%28SUM%28S2%29*2%29*100&Fu
nctionLabel1={avg}%25&OutputFormat=CSV_TRANSPOSE';}
                }
                , graph: {
                    "SS Recirc": function() { return '<img 
src="https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=BDL2-
ShippingSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Wareh
ouseControlService&MethodName1=SortationOrchestrator.divert&Client1=ALL&
MetricClass1=NONE&Instance1=NONE&Metric1=RECIRC&Period1=FiveMinute
&Stat1=n&Label1=Service n&SchemaName2=Search&Pattern2=BDL2-
ShippingSorterController Time SortationOrchestrator.scan 
schemaname%3DService 
metric%3D%24Time%24&HeightInPixels=250&WidthInPixels=600&GraphTitle=B
DL2%20Ship%20Sorter%20Recirc&LegendPlacement=right&DecoratePoints=true
&TZ=EST5EDT@TZ%3A%20EST5EDT&ShowGaps=false&HorizontalLineLeft1=Es
calation%20%23color%3Dred%20-
%20@%2010%2CGoal%20%23color%3Dgreen%20-
%20@6&LabelRight=Incoming%20carton%20count&StartTime1=' + 
links.start.toISOString() + '&EndTime1=' + links.end.toISOString() + 
'&FunctionExpression1=SUM%28M1%29%2F%28SUM%28S2%29*2%29*100&Fu
nctionLabel1=Ship%20Sorter%20Recirc%20%5BAvg%3A%20%7Bavg%7D%20%7
C%20latest%3A%20%7Blast%7D%5D%5D&FunctionYAxisPreference1=left&Funct
ionColor1=default&timestamp=' + new Date().getTime() + '"></img>'; }
                }
            }
            , BDL3: {
                metric: {
                    "FS Recirc": function() {return 
'https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=BDL3-
FlatSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Warehouse
ControlService&MethodName1=SortationOrchestrator.scan&Client1=ALL&Metric
Class1=NONE&Instance1=NONE&Metric1=F01aa-
scan&Period1=FiveMinute&Stat1=n&LiveData1=true&Label1=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
scan&SchemaName2=Service&Metric2=F01aa-multiRead&Label2=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
multiRead&SchemaName3=Service&Metric3=F01aa-noCode&Label3=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noCode&SchemaName4=Service&Metric4=F01aa-noRead&Label4=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noRead&SchemaName5=Service&Metric5=F01aa-recirc&Label5=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
recirc&SchemaName6=Service&Metric6=F01ab-scan&Label6=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
scan&SchemaName7=Service&Metric7=F01ab-multiRead&Label7=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
multiRead&SchemaName8=Service&Metric8=F01ab-noCode&Label8=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noCode&SchemaName9=Service&Metric9=F01ab-noRead&Label9=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noRead&SchemaName10=Service&Metric10=F01ab-recirc&Label10=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
recirc&SchemaName11=Service&MethodName11=SortationOrchestrator.divert&
Metric11=actDestStatus-F01088%3ASUCCESS&Label11=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01088%3ASUCCESS&SchemaName12=Service&Metric12=actDestStatus-
F01086%3ASUCCESS&Label12=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01086%3ASUCCESS&SchemaName13=Service&Metric13=actDestStatus-
F01090%3ASUCCESS&Label13=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01090%3ASUCCESS&SchemaName14=Service&Metric14=missed-status-
LANE_FULL&Label14=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName15=Service&Metric15=missed&Label15=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed&SchemaName16
=Service&Metric16=missed-status-FAILED_TO_DIVERT&Label16=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
FAILED_TO_DIVERT&SchemaName17=Service&Metric17=final-status-
SUCCESS&Label17=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName18=Service&Metric18=missed-status-
INVALID_DESTINATION&Label18=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
INVALID_DESTINATION&SchemaName19=Service&Metric19=missed-status-
LANE_FULL&Label19=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName20=Service&Metric20=missed-status-
LOST_CONTAINER&Label20=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LOST_CONTAINER&SchemaName21=Service&Metric21=missed-status-
NO_DESTINATION_RECEIVED&Label21=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
NO_DESTINATION_RECEIVED&SchemaName22=Service&Metric22=final-status-
SUCCESS&Label22=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName23=Service&Metric23=missed-status-
LANE_FULL&Label23=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName24=Service&Metric24=missed-status-
LANE_UNAVAILABLE&Label24=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_UNAVAILABLE&SchemaName25=Service&Marketplace25=BDL3-
ShippingSorterController&MethodName25=SortationOrchestrator.scan&Metric25
=01-scan&Label25=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
scan&SchemaName26=Service&Metric26=01-recirc&Label26=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
recirc&HeightInPixels=350&WidthInPixels=650&GraphTitle=FS%20Operational
%20Recirc%20%26%20SS%20Recirc&DecoratePoints=true&TZ=EST5EDT@TZ%
3A%20EST5EDT&HorizontalLineLeft1=%28%23color%3Dgreen%20%23textAncho
r%3Dbottom_left%20-%20@%200%2CStandard%20%23color%3Dgreen%20-
%20@%2015%29%2C%28%23color%3Dorange%20%23textAnchor%3Dbottom_left
%20-%20@%2015%2CAM%20Escalation%20%23color%3Dorange%20-
%20@%2035%29%2C%28%23color%3Dred%20%23textAnchor%3Dbottom_left%2
0-%20@%2035%2CSr%20Ops%20Escalation%20%23color%3Dred%20-
%20@%2050%29%2C%28%23color%3Dblack%20%23textAnchor%3Dbottom_left
%20-%20@%2050%2CGM%20Escalation%20%23color%3Dblack%20-
%20@%20100%29&VerticalLine1=%28%23color%3Dblack%20%23horizontal%3D
true%20%23rotationAngle%3D90%20RT%20Break%20@%20yesterday%201%3A3
0am%2C%23color%3Dblack%20@%20yesterday%202%3A00am%29%2C%28%23c
olor%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Hando
ff%20@%20yesterday%204%3A00am%2C%23color%3Dblack%20@%20yesterday
%204%3A30am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Days%20Lunch%20@%20yesterday%207%3A00am%2
C%23color%3Dblack%20@%20yesterday%208%3A00am%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Days%20Paid
%20Break%20@%20yesterday%2011%3A00am%2C%23color%3Dblack%20@%20y
esterday%2012%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dt
rue%20%23rotationAngle%3D90%20Handoff%20@%20yesterday%203%3A00pm%
2C%23color%3Dblack%20@%20yesterday%203%3A30pm%29%2C%28%23color%
3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lu
nch%20@%20yesterday%207%3A00pm%2C%23color%3Dblack%20@%20yesterda
y%208%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Nights%20Paid%20Break%20@%20yesterday%2023%
3A00pm%2C%23color%3Dblack%20@%20yesterday%2023%3A59pm%29%2C%28
%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20R
T%20Break%20@%201%3A30am%2C%23color%3Dblack%20@%202%3A00am%2
9%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3
D90%20Handoff%20@%204%3A00am%2C%23color%3Dblack%20@%204%3A30a
m%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngl
e%3D90%20Days%20Lunch%20@%207%3A00am%2C%23color%3Dblack%20@%
208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23
rotationAngle%3D90%20Days%20Paid%20Break%20@%2011%3A00am%2C%23c
olor%3Dblack%20@%2012%3A00pm%29%2C%28%23color%3Dblack%20%23hori
zontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%203%3A00pm%2
C%23color%3Dblack%20@%203%3A30pm%29%2C%28%23color%3Dblack%20%2
3horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%207
%3A00pm%2C%23color%3Dblack%20@%208%3A00pm%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Pai
d%20Break%20@%2023%3A00pm%2C%23color%3Dblack%20@%2023%3A59pm
%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle
%3D90%20RT%20Break%20@%20tomorrow%201%3A30am%2C%23color%3Dbla
ck%20@%20tomorrow%202%3A00am%29%2C%28%23color%3Dblack%20%23hor
izontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%20tomorrow%204
%3A00am%2C%23color%3Dblack%20@%20tomorrow%204%3A30am%29%2C%2
8%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20
Days%20Lunch%20@%20tomorrow%207%3A00am%2C%23color%3Dblack%20@
%20tomorrow%208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%
3Dtrue%20%23rotationAngle%3D90%20Days%20Paid%20Break%20@%20tomorr
ow%2011%3A00am%2C%23color%3Dblack%20@%20tomorrow%2012%3A00pm%
29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%
3D90%20Handoff%20@%20tomorrow%203%3A00pm%2C%23color%3Dblack%20
@%20tomorrow%203%3A30pm%29%2C%28%23color%3Dblack%20%23horizontal
%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%20tomorrow%
207%3A00pm%2C%23color%3Dblack%20@%20tomorrow%208%3A00pm%29%2C
%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%
20Nights%20Paid%20Break%20@%20tomorrow%2023%3A00pm%2C%23color%3
Dblack%20@%20tomorrow%2023%3A59pm%29&StartTime1=' + 
links.start.toISOString() + '&EndTime1='  + links.end.toISOString() + 
'&FunctionExpression1=%28%28M23%2BM24%29%2F%28M22%2BM23%2BM24
%2BM4%2BM9%2BM16%2BM18%29%29*100&FunctionLabel1=%7Bavg%7D%25
&FunctionYAxisPreference1=left&FunctionColor1=default&FunctionExpression2
=SUM%28M26%29%2F%28SUM%28M25%2CM26%29%29*100&FunctionLabel2
=%7Bavg%7D%25&FunctionYAxisPreference2=left&FunctionColor2=default&Out
putFormat=CSV_TRANSPOSE' }
                    ,"SS Recirc": function() {return 
'https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=BDL3-
FlatSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Warehouse
ControlService&MethodName1=SortationOrchestrator.scan&Client1=ALL&Metric
Class1=NONE&Instance1=NONE&Metric1=F01aa-
scan&Period1=FiveMinute&Stat1=n&LiveData1=true&Label1=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
scan&SchemaName2=Service&Metric2=F01aa-multiRead&Label2=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
multiRead&SchemaName3=Service&Metric3=F01aa-noCode&Label3=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noCode&SchemaName4=Service&Metric4=F01aa-noRead&Label4=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noRead&SchemaName5=Service&Metric5=F01aa-recirc&Label5=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
recirc&SchemaName6=Service&Metric6=F01ab-scan&Label6=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
scan&SchemaName7=Service&Metric7=F01ab-multiRead&Label7=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
multiRead&SchemaName8=Service&Metric8=F01ab-noCode&Label8=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noCode&SchemaName9=Service&Metric9=F01ab-noRead&Label9=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noRead&SchemaName10=Service&Metric10=F01ab-recirc&Label10=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
recirc&SchemaName11=Service&MethodName11=SortationOrchestrator.divert&
Metric11=actDestStatus-F01088%3ASUCCESS&Label11=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01088%3ASUCCESS&SchemaName12=Service&Metric12=actDestStatus-
F01086%3ASUCCESS&Label12=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01086%3ASUCCESS&SchemaName13=Service&Metric13=actDestStatus-
F01090%3ASUCCESS&Label13=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01090%3ASUCCESS&SchemaName14=Service&Metric14=missed-status-
LANE_FULL&Label14=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName15=Service&Metric15=missed&Label15=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed&SchemaName16
=Service&Metric16=missed-status-FAILED_TO_DIVERT&Label16=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
FAILED_TO_DIVERT&SchemaName17=Service&Metric17=final-status-
SUCCESS&Label17=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName18=Service&Metric18=missed-status-
INVALID_DESTINATION&Label18=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
INVALID_DESTINATION&SchemaName19=Service&Metric19=missed-status-
LANE_FULL&Label19=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName20=Service&Metric20=missed-status-
LOST_CONTAINER&Label20=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LOST_CONTAINER&SchemaName21=Service&Metric21=missed-status-
NO_DESTINATION_RECEIVED&Label21=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
NO_DESTINATION_RECEIVED&SchemaName22=Service&Metric22=final-status-
SUCCESS&Label22=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName23=Service&Metric23=missed-status-
LANE_FULL&Label23=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName24=Service&Metric24=missed-status-
LANE_UNAVAILABLE&Label24=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_UNAVAILABLE&SchemaName25=Service&Marketplace25=BDL3-
ShippingSorterController&MethodName25=SortationOrchestrator.scan&Metric25
=01-scan&Label25=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
scan&SchemaName26=Service&Metric26=01-recirc&Label26=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
recirc&HeightInPixels=350&WidthInPixels=650&GraphTitle=FS%20Operational
%20Recirc%20%26%20SS%20Recirc&DecoratePoints=true&TZ=EST5EDT@TZ%
3A%20EST5EDT&HorizontalLineLeft1=%28%23color%3Dgreen%20%23textAncho
r%3Dbottom_left%20-%20@%200%2CStandard%20%23color%3Dgreen%20-
%20@%2015%29%2C%28%23color%3Dorange%20%23textAnchor%3Dbottom_left
%20-%20@%2015%2CAM%20Escalation%20%23color%3Dorange%20-
%20@%2035%29%2C%28%23color%3Dred%20%23textAnchor%3Dbottom_left%2
0-%20@%2035%2CSr%20Ops%20Escalation%20%23color%3Dred%20-
%20@%2050%29%2C%28%23color%3Dblack%20%23textAnchor%3Dbottom_left
%20-%20@%2050%2CGM%20Escalation%20%23color%3Dblack%20-
%20@%20100%29&VerticalLine1=%28%23color%3Dblack%20%23horizontal%3D
true%20%23rotationAngle%3D90%20RT%20Break%20@%20yesterday%201%3A3
0am%2C%23color%3Dblack%20@%20yesterday%202%3A00am%29%2C%28%23c
olor%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Hando
ff%20@%20yesterday%204%3A00am%2C%23color%3Dblack%20@%20yesterday
%204%3A30am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Days%20Lunch%20@%20yesterday%207%3A00am%2
C%23color%3Dblack%20@%20yesterday%208%3A00am%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Days%20Paid
%20Break%20@%20yesterday%2011%3A00am%2C%23color%3Dblack%20@%20y
esterday%2012%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dt
rue%20%23rotationAngle%3D90%20Handoff%20@%20yesterday%203%3A00pm%
2C%23color%3Dblack%20@%20yesterday%203%3A30pm%29%2C%28%23color%
3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lu
nch%20@%20yesterday%207%3A00pm%2C%23color%3Dblack%20@%20yesterda
y%208%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Nights%20Paid%20Break%20@%20yesterday%2023%
3A00pm%2C%23color%3Dblack%20@%20yesterday%2023%3A59pm%29%2C%28
%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20R
T%20Break%20@%201%3A30am%2C%23color%3Dblack%20@%202%3A00am%2
9%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3
D90%20Handoff%20@%204%3A00am%2C%23color%3Dblack%20@%204%3A30a
m%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngl
e%3D90%20Days%20Lunch%20@%207%3A00am%2C%23color%3Dblack%20@%
208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23
rotationAngle%3D90%20Days%20Paid%20Break%20@%2011%3A00am%2C%23c
olor%3Dblack%20@%2012%3A00pm%29%2C%28%23color%3Dblack%20%23hori
zontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%203%3A00pm%2
C%23color%3Dblack%20@%203%3A30pm%29%2C%28%23color%3Dblack%20%2
3horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%207
%3A00pm%2C%23color%3Dblack%20@%208%3A00pm%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Pai
d%20Break%20@%2023%3A00pm%2C%23color%3Dblack%20@%2023%3A59pm
%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle
%3D90%20RT%20Break%20@%20tomorrow%201%3A30am%2C%23color%3Dbla
ck%20@%20tomorrow%202%3A00am%29%2C%28%23color%3Dblack%20%23hor
izontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%20tomorrow%204
%3A00am%2C%23color%3Dblack%20@%20tomorrow%204%3A30am%29%2C%2
8%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20
Days%20Lunch%20@%20tomorrow%207%3A00am%2C%23color%3Dblack%20@
%20tomorrow%208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%
3Dtrue%20%23rotationAngle%3D90%20Days%20Paid%20Break%20@%20tomorr
ow%2011%3A00am%2C%23color%3Dblack%20@%20tomorrow%2012%3A00pm%
29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%
3D90%20Handoff%20@%20tomorrow%203%3A00pm%2C%23color%3Dblack%20
@%20tomorrow%203%3A30pm%29%2C%28%23color%3Dblack%20%23horizontal
%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%20tomorrow%
207%3A00pm%2C%23color%3Dblack%20@%20tomorrow%208%3A00pm%29%2C
%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%
20Nights%20Paid%20Break%20@%20tomorrow%2023%3A00pm%2C%23color%3
Dblack%20@%20tomorrow%2023%3A59pm%29&StartTime1=' + 
links.start.toISOString() + '&EndTime1='  + links.end.toISOString() + 
'&FunctionExpression1=SUM%28M26%29%2F%28SUM%28M25%2CM26%29%2
9*100&FunctionLabel1=%7Bavg%7D%25&FunctionYAxisPreference1=left&Functi
onColor1=default&OutputFormat=CSV_TRANSPOSE' }
                }
                , graph: {
                    "FS Recirc": function() { return '<img 
src="https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=BDL3-
FlatSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Warehouse
ControlService&MethodName1=SortationOrchestrator.scan&Client1=ALL&Metric
Class1=NONE&Instance1=NONE&Metric1=F01aa-
scan&Period1=FiveMinute&Stat1=n&LiveData1=true&Label1=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
scan&SchemaName2=Service&Metric2=F01aa-multiRead&Label2=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
multiRead&SchemaName3=Service&Metric3=F01aa-noCode&Label3=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noCode&SchemaName4=Service&Metric4=F01aa-noRead&Label4=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noRead&SchemaName5=Service&Metric5=F01aa-recirc&Label5=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
recirc&SchemaName6=Service&Metric6=F01ab-scan&Label6=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
scan&SchemaName7=Service&Metric7=F01ab-multiRead&Label7=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
multiRead&SchemaName8=Service&Metric8=F01ab-noCode&Label8=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noCode&SchemaName9=Service&Metric9=F01ab-noRead&Label9=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noRead&SchemaName10=Service&Metric10=F01ab-recirc&Label10=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
recirc&SchemaName11=Service&MethodName11=SortationOrchestrator.divert&
Metric11=actDestStatus-F01088%3ASUCCESS&Label11=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01088%3ASUCCESS&SchemaName12=Service&Metric12=actDestStatus-
F01086%3ASUCCESS&Label12=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01086%3ASUCCESS&SchemaName13=Service&Metric13=actDestStatus-
F01090%3ASUCCESS&Label13=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01090%3ASUCCESS&SchemaName14=Service&Metric14=missed-status-
LANE_FULL&Label14=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName15=Service&Metric15=missed&Label15=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed&SchemaName16
=Service&Metric16=missed-status-FAILED_TO_DIVERT&Label16=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
FAILED_TO_DIVERT&SchemaName17=Service&Metric17=final-status-
SUCCESS&Label17=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName18=Service&Metric18=missed-status-
INVALID_DESTINATION&Label18=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
INVALID_DESTINATION&SchemaName19=Service&Metric19=missed-status-
LANE_FULL&Label19=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName20=Service&Metric20=missed-status-
LOST_CONTAINER&Label20=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LOST_CONTAINER&SchemaName21=Service&Metric21=missed-status-
NO_DESTINATION_RECEIVED&Label21=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
NO_DESTINATION_RECEIVED&SchemaName22=Service&Metric22=final-status-
SUCCESS&Label22=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName23=Service&Metric23=missed-status-
LANE_FULL&Label23=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName24=Service&Metric24=missed-status-
LANE_UNAVAILABLE&Label24=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_UNAVAILABLE&SchemaName25=Service&Marketplace25=BDL3-
ShippingSorterController&MethodName25=SortationOrchestrator.scan&Metric25
=01-scan&Label25=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
scan&SchemaName26=Service&Metric26=01-recirc&Label26=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
recirc&HeightInPixels=350&WidthInPixels=650&GraphTitle=FS%20Operational
%20Recirc%20%26%20SS%20Recirc&DecoratePoints=true&TZ=EST5EDT@TZ%
3A%20EST5EDT&HorizontalLineLeft1=%28%23color%3Dgreen%20%23textAncho
r%3Dbottom_left%20-%20@%200%2CStandard%20%23color%3Dgreen%20-
%20@%2015%29%2C%28%23color%3Dorange%20%23textAnchor%3Dbottom_left
%20-%20@%2015%2CAM%20Escalation%20%23color%3Dorange%20-
%20@%2035%29%2C%28%23color%3Dred%20%23textAnchor%3Dbottom_left%2
0-%20@%2035%2CSr%20Ops%20Escalation%20%23color%3Dred%20-
%20@%2050%29%2C%28%23color%3Dblack%20%23textAnchor%3Dbottom_left
%20-%20@%2050%2CGM%20Escalation%20%23color%3Dblack%20-
%20@%20100%29&VerticalLine1=%28%23color%3Dblack%20%23horizontal%3D
true%20%23rotationAngle%3D90%20RT%20Break%20@%20yesterday%201%3A3
0am%2C%23color%3Dblack%20@%20yesterday%202%3A00am%29%2C%28%23c
olor%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Hando
ff%20@%20yesterday%204%3A00am%2C%23color%3Dblack%20@%20yesterday
%204%3A30am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Days%20Lunch%20@%20yesterday%207%3A00am%2
C%23color%3Dblack%20@%20yesterday%208%3A00am%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Days%20Paid
%20Break%20@%20yesterday%2011%3A00am%2C%23color%3Dblack%20@%20y
esterday%2012%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dt
rue%20%23rotationAngle%3D90%20Handoff%20@%20yesterday%203%3A00pm%
2C%23color%3Dblack%20@%20yesterday%203%3A30pm%29%2C%28%23color%
3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lu
nch%20@%20yesterday%207%3A00pm%2C%23color%3Dblack%20@%20yesterda
y%208%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Nights%20Paid%20Break%20@%20yesterday%2023%
3A00pm%2C%23color%3Dblack%20@%20yesterday%2023%3A59pm%29%2C%28
%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20R
T%20Break%20@%201%3A30am%2C%23color%3Dblack%20@%202%3A00am%2
9%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3
D90%20Handoff%20@%204%3A00am%2C%23color%3Dblack%20@%204%3A30a
m%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngl
e%3D90%20Days%20Lunch%20@%207%3A00am%2C%23color%3Dblack%20@%
208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23
rotationAngle%3D90%20Days%20Paid%20Break%20@%2011%3A00am%2C%23c
olor%3Dblack%20@%2012%3A00pm%29%2C%28%23color%3Dblack%20%23hori
zontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%203%3A00pm%2
C%23color%3Dblack%20@%203%3A30pm%29%2C%28%23color%3Dblack%20%2
3horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%207
%3A00pm%2C%23color%3Dblack%20@%208%3A00pm%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Pai
d%20Break%20@%2023%3A00pm%2C%23color%3Dblack%20@%2023%3A59pm
%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle
%3D90%20RT%20Break%20@%20tomorrow%201%3A30am%2C%23color%3Dbla
ck%20@%20tomorrow%202%3A00am%29%2C%28%23color%3Dblack%20%23hor
izontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%20tomorrow%204
%3A00am%2C%23color%3Dblack%20@%20tomorrow%204%3A30am%29%2C%2
8%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20
Days%20Lunch%20@%20tomorrow%207%3A00am%2C%23color%3Dblack%20@
%20tomorrow%208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%
3Dtrue%20%23rotationAngle%3D90%20Days%20Paid%20Break%20@%20tomorr
ow%2011%3A00am%2C%23color%3Dblack%20@%20tomorrow%2012%3A00pm%
29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%
3D90%20Handoff%20@%20tomorrow%203%3A00pm%2C%23color%3Dblack%20
@%20tomorrow%203%3A30pm%29%2C%28%23color%3Dblack%20%23horizontal
%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%20tomorrow%
207%3A00pm%2C%23color%3Dblack%20@%20tomorrow%208%3A00pm%29%2C
%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%
20Nights%20Paid%20Break%20@%20tomorrow%2023%3A00pm%2C%23color%3
Dblack%20@%20tomorrow%2023%3A59pm%29&StartTime1=' + 
links.start.toISOString() + '&EndTime1='  + links.end.toISOString() + 
'&FunctionExpression1=%28%28M23%2BM24%29%2F%28M22%2BM23%2BM24
%2BM4%2BM9%2BM16%2BM18%29%29*100&FunctionLabel1=FS%20Operation
al%20Recirc%20%7Bavg%7D%25&FunctionYAxisPreference1=left&FunctionColor
1=default&FunctionExpression2=SUM%28M26%29%2F%28SUM%28M25%2CM2
6%29%29*100&FunctionLabel2=SS%20Recirc%20Avg.
%20%7Bavg%7D%25&FunctionYAxisPreference2=left&FunctionColor2=default&
actionSource=dashboard&timestamp=' + new Date().getTime() + '"></img>'}
                    ,"SS Recirc": function() { return '<img 
src="https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=BDL3-
FlatSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Warehouse
ControlService&MethodName1=SortationOrchestrator.scan&Client1=ALL&Metric
Class1=NONE&Instance1=NONE&Metric1=F01aa-
scan&Period1=FiveMinute&Stat1=n&LiveData1=true&Label1=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
scan&SchemaName2=Service&Metric2=F01aa-multiRead&Label2=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
multiRead&SchemaName3=Service&Metric3=F01aa-noCode&Label3=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noCode&SchemaName4=Service&Metric4=F01aa-noRead&Label4=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
noRead&SchemaName5=Service&Metric5=F01aa-recirc&Label5=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01aa-
recirc&SchemaName6=Service&Metric6=F01ab-scan&Label6=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
scan&SchemaName7=Service&Metric7=F01ab-multiRead&Label7=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
multiRead&SchemaName8=Service&Metric8=F01ab-noCode&Label8=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noCode&SchemaName9=Service&Metric9=F01ab-noRead&Label9=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
noRead&SchemaName10=Service&Metric10=F01ab-recirc&Label10=BDL3-
FlatSorterController%20SortationOrchestrator.scan%20F01ab-
recirc&SchemaName11=Service&MethodName11=SortationOrchestrator.divert&
Metric11=actDestStatus-F01088%3ASUCCESS&Label11=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01088%3ASUCCESS&SchemaName12=Service&Metric12=actDestStatus-
F01086%3ASUCCESS&Label12=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01086%3ASUCCESS&SchemaName13=Service&Metric13=actDestStatus-
F01090%3ASUCCESS&Label13=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20actDestStatus-
F01090%3ASUCCESS&SchemaName14=Service&Metric14=missed-status-
LANE_FULL&Label14=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName15=Service&Metric15=missed&Label15=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed&SchemaName16
=Service&Metric16=missed-status-FAILED_TO_DIVERT&Label16=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
FAILED_TO_DIVERT&SchemaName17=Service&Metric17=final-status-
SUCCESS&Label17=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName18=Service&Metric18=missed-status-
INVALID_DESTINATION&Label18=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
INVALID_DESTINATION&SchemaName19=Service&Metric19=missed-status-
LANE_FULL&Label19=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName20=Service&Metric20=missed-status-
LOST_CONTAINER&Label20=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LOST_CONTAINER&SchemaName21=Service&Metric21=missed-status-
NO_DESTINATION_RECEIVED&Label21=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
NO_DESTINATION_RECEIVED&SchemaName22=Service&Metric22=final-status-
SUCCESS&Label22=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20final-status-
SUCCESS&SchemaName23=Service&Metric23=missed-status-
LANE_FULL&Label23=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_FULL&SchemaName24=Service&Metric24=missed-status-
LANE_UNAVAILABLE&Label24=BDL3-
FlatSorterController%20SortationOrchestrator.divert%20missed-status-
LANE_UNAVAILABLE&SchemaName25=Service&Marketplace25=BDL3-
ShippingSorterController&MethodName25=SortationOrchestrator.scan&Metric25
=01-scan&Label25=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
scan&SchemaName26=Service&Metric26=01-recirc&Label26=BDL3-
ShippingSorterController%20SortationOrchestrator.scan%2001-
recirc&HeightInPixels=350&WidthInPixels=650&GraphTitle=FS%20Operational
%20Recirc%20%26%20SS%20Recirc&DecoratePoints=true&TZ=EST5EDT@TZ%
3A%20EST5EDT&HorizontalLineLeft1=%28%23color%3Dgreen%20%23textAncho
r%3Dbottom_left%20-%20@%200%2CStandard%20%23color%3Dgreen%20-
%20@%2015%29%2C%28%23color%3Dorange%20%23textAnchor%3Dbottom_left
%20-%20@%2015%2CAM%20Escalation%20%23color%3Dorange%20-
%20@%2035%29%2C%28%23color%3Dred%20%23textAnchor%3Dbottom_left%2
0-%20@%2035%2CSr%20Ops%20Escalation%20%23color%3Dred%20-
%20@%2050%29%2C%28%23color%3Dblack%20%23textAnchor%3Dbottom_left
%20-%20@%2050%2CGM%20Escalation%20%23color%3Dblack%20-
%20@%20100%29&VerticalLine1=%28%23color%3Dblack%20%23horizontal%3D
true%20%23rotationAngle%3D90%20RT%20Break%20@%20yesterday%201%3A3
0am%2C%23color%3Dblack%20@%20yesterday%202%3A00am%29%2C%28%23c
olor%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Hando
ff%20@%20yesterday%204%3A00am%2C%23color%3Dblack%20@%20yesterday
%204%3A30am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Days%20Lunch%20@%20yesterday%207%3A00am%2
C%23color%3Dblack%20@%20yesterday%208%3A00am%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Days%20Paid
%20Break%20@%20yesterday%2011%3A00am%2C%23color%3Dblack%20@%20y
esterday%2012%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dt
rue%20%23rotationAngle%3D90%20Handoff%20@%20yesterday%203%3A00pm%
2C%23color%3Dblack%20@%20yesterday%203%3A30pm%29%2C%28%23color%
3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lu
nch%20@%20yesterday%207%3A00pm%2C%23color%3Dblack%20@%20yesterda
y%208%3A00pm%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%
23rotationAngle%3D90%20Nights%20Paid%20Break%20@%20yesterday%2023%
3A00pm%2C%23color%3Dblack%20@%20yesterday%2023%3A59pm%29%2C%28
%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20R
T%20Break%20@%201%3A30am%2C%23color%3Dblack%20@%202%3A00am%2
9%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3
D90%20Handoff%20@%204%3A00am%2C%23color%3Dblack%20@%204%3A30a
m%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngl
e%3D90%20Days%20Lunch%20@%207%3A00am%2C%23color%3Dblack%20@%
208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23
rotationAngle%3D90%20Days%20Paid%20Break%20@%2011%3A00am%2C%23c
olor%3Dblack%20@%2012%3A00pm%29%2C%28%23color%3Dblack%20%23hori
zontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%203%3A00pm%2
C%23color%3Dblack%20@%203%3A30pm%29%2C%28%23color%3Dblack%20%2
3horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%207
%3A00pm%2C%23color%3Dblack%20@%208%3A00pm%29%2C%28%23color%3
Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20Nights%20Pai
d%20Break%20@%2023%3A00pm%2C%23color%3Dblack%20@%2023%3A59pm
%29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle
%3D90%20RT%20Break%20@%20tomorrow%201%3A30am%2C%23color%3Dbla
ck%20@%20tomorrow%202%3A00am%29%2C%28%23color%3Dblack%20%23hor
izontal%3Dtrue%20%23rotationAngle%3D90%20Handoff%20@%20tomorrow%204
%3A00am%2C%23color%3Dblack%20@%20tomorrow%204%3A30am%29%2C%2
8%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%20
Days%20Lunch%20@%20tomorrow%207%3A00am%2C%23color%3Dblack%20@
%20tomorrow%208%3A00am%29%2C%28%23color%3Dblack%20%23horizontal%
3Dtrue%20%23rotationAngle%3D90%20Days%20Paid%20Break%20@%20tomorr
ow%2011%3A00am%2C%23color%3Dblack%20@%20tomorrow%2012%3A00pm%
29%2C%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%
3D90%20Handoff%20@%20tomorrow%203%3A00pm%2C%23color%3Dblack%20
@%20tomorrow%203%3A30pm%29%2C%28%23color%3Dblack%20%23horizontal
%3Dtrue%20%23rotationAngle%3D90%20Nights%20Lunch%20@%20tomorrow%
207%3A00pm%2C%23color%3Dblack%20@%20tomorrow%208%3A00pm%29%2C
%28%23color%3Dblack%20%23horizontal%3Dtrue%20%23rotationAngle%3D90%
20Nights%20Paid%20Break%20@%20tomorrow%2023%3A00pm%2C%23color%3
Dblack%20@%20tomorrow%2023%3A59pm%29&StartTime1=' + 
links.start.toISOString() + '&EndTime1='  + links.end.toISOString() + 
'&FunctionExpression1=%28%28M23%2BM24%29%2F%28M22%2BM23%2BM24
%2BM4%2BM9%2BM16%2BM18%29%29*100&FunctionLabel1=FS%20Operation
al%20Recirc%20%7Bavg%7D%25&FunctionYAxisPreference1=left&FunctionColor
1=default&FunctionExpression2=SUM%28M26%29%2F%28SUM%28M25%2CM2
6%29%29*100&FunctionLabel2=SS%20Recirc%20Avg.
%20%7Bavg%7D%25&FunctionYAxisPreference2=left&FunctionColor2=default&
actionSource=dashboard&timestamp=' + new Date().getTime() + '"></img>'}
                }
            }
            , DCA1: {
                metric: {
                    "SS Recirc": function() { return 
'https://monitorportal.amazon.com/mws?Action=GetGraph&Version=2007-07-
07&SchemaName1=Service&DataSet1=Prod&Marketplace1=DCA1-
ShippingSorterController&HostGroup1=ALL&Host1=ALL&ServiceName1=Wareh
ouseControlService&MethodName1=SortationOrchestrator.divert&Client1=ALL&
MetricClass1=NONE&Instance1=NONE&Metric1=actDestStatus-
RECIRC%3ALANE_FULL&Period1=FiveMinute&Stat1=n&Label1=Service%20Sor
tationOrchestrator.divert%20actDestStatus-
RECIRC%3ALANE_FULL&SchemaName2=Service&Metric2=actDestStatus-
RECIRC%3ALANE_UNAVAILABLE&Label2=Service%20SortationOrchestrator.div
ert%20actDestStatus-
RECIRC%3ALANE_UNAVAILABLE&SchemaName3=Service&Metric3=actDestSta
tus-
RECIRC%3ATHROUGHPUT_LIMIT&Label3=Service%20SortationOrchestrator.div
ert%20actDestStatus-
RECIRC%3ATHROUGHPUT_LIMIT&SchemaName4=Service&Metric4=actDestSta
tus-
RECIRC%3AFAILED_TO_DIVERT&Label4=Service%20SortationOrchestrator.diver
t%20actDestStatus-
RECIRC%3AFAILED_TO_DIVERT&SchemaName5=Service&Metric5=actDestStat
us-
RECIRC%3AGAP_ERROR&Label5=Service%20SortationOrchestrator.divert%20ac
tDestStatus-
RECIRC%3AGAP_ERROR&SchemaName6=Service&Metric6=actDestStatus-
RECIRC%3ANO_DESTINATION_RECEIVED&Label6=Service%20SortationOrchest
rator.divert%20actDestStatus-
RECIRC%3ANO_DESTINATION_RECEIVED&SchemaName7=Service&Metric7=ac
tDestStatus-
RECIRC%3ASUCCESS&Label7=Service%20SortationOrchestrator.divert%20actD
estStatus-
RECIRC%3ASUCCESS&SchemaName8=Service&Metric8=actDestStatus-
RECIRC%3ANO_READ&Label8=Service%20SortationOrchestrator.divert%20actD
estStatus-
RECIRC%3ANO_READ&SchemaName9=Service&Metric9=actDestStatus-
RECIRC%3AMULTI_LABEL&Label9=Service%20SortationOrchestrator.divert%20
actDestStatus-
RECIRC%3AMULTI_LABEL&SchemaName10=Service&Metric10=actDestStatus-
RECIRC%3ANO_CODE&Label10=Service%20SortationOrchestrator.divert%20act
DestStatus-
RECIRC%3ANO_CODE&SchemaName11=Service&MethodName11=SortationOrc
hestrator.scan&Metric11=scan&Label11=Service%20SortationOrchestrator.scan
%20scan&SchemaName12=Search&Pattern12=DCA1%20Rodeo%20WorkPoolSize
%20Scanned%20PPAFE%20OR%20PPSingle%20OR%20PPMix%20OR%20PPSmar
tPac%20OR%20PPHighQuantity&Period12=OneMinute&Stat12=avg&YAxisPrefer
ence12=right&HeightInPixels=400&WidthInPixels=800&GraphTitle=DCA1%20Sh
ip%20Sorter%20Recirc&DecoratePoints=true&TZ=EST5EDT@TZ%3A%20EST5E
DT&ShowLegendErrors=false&HorizontalLineLeft1=%28%23color%3Dgreen%20
%23textAnchor%3Dbottom_left%20-
%20@%200%2CClean%20%23color%3Dgreen%20-
