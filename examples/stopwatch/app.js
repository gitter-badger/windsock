//(function(){

    var perf = {};

    perf.beforeParse = window.performance.now();
    var timersList = windsock.parse(document.getElementById('ws-timers'));
    perf.afterParse = window.performance.now();


    //var t = timersList._transclude.querySelector('.timer');

    var timerListItem = timersList.find({class:'timer'});




    perf.beforeClone = window.performance.now();
    var listItem = timerListItem.clone(true);
    perf.afterClone = window.performance.now();





    timerListItem.destroy();

    perf.beforeAppend = window.performance.now();
    var i = 100; //100ms
    while(i){
        timersList.append(listItem.clone(true));//44.9ms
        //timersList._transclude.appendChild(t.cloneNode(true)); //1.4ms
        i--;
    }
    perf.afterAppend = window.performance.now();

    var compiledTimerList = windsock.compile(timersList);

    perf.afterCompile = window.performance.now();

    windsock.transclude(compiledTimerList);


    console.log('parse took ' + (perf.afterParse - perf.beforeParse) + ' milliseconds.');
    console.log('clone took ' + (perf.afterClone - perf.beforeClone) + ' milliseconds.');
    console.log('append took ' + (perf.afterAppend - perf.beforeAppend) + ' milliseconds.');
    console.log('compile took ' + (perf.afterCompile - perf.afterAppend) + ' milliseconds.');


    //compiledTimerList.destroy();

//})();
