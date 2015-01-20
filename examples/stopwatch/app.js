
var perf = {},
    template, timersList, timerListItem, listItem, compiledTimerList, timer = document.querySelector('.timer');

perf.beforeParse = window.performance.now();//-----------------------
template = windsock.parse(timer);
perf.beforeClone = window.performance.now();//-----------------------
listItem = template.children[0].clone(true);
perf.afterClone = window.performance.now();//-----------------------
var i = 100, c, a, b, avgClone = [], avgAppend = [], d, e;
while(i){
    a = window.performance.now();
    c = listItem.clone(true);
    b = window.performance.now();
    avgClone.push(b - a);
    d = window.performance.now();
    template.append(c);
    e = window.performance.now();
    avgAppend.push(e - d);
    i--;
}
perf.afterAppend = window.performance.now();//-----------------------
compiledTimerList = windsock.compile(template);
perf.afterCompile = window.performance.now();//-----------------------
windsock.transclude(compiledTimerList);
perf.afterTransclude = window.performance.now();//-----------------------
i = 99;
while(i >= 0){
    compiledTimerList.children[i].remove();
    i--;
}
perf.afterRemove = window.performance.now();//-----------------------

console.log('parse took ' + (perf.beforeClone - perf.beforeParse) + ' milliseconds.');
console.log('clone took ' + (perf.afterClone - perf.beforeClone) + ' milliseconds.');
console.log('average clone took ' + average(avgClone) + ' milliseconds.');
console.log('append took ' + (perf.afterAppend - perf.afterClone) + ' milliseconds.');
console.log('average append took ' + average(avgAppend) + ' milliseconds.');
console.log('compile took ' + (perf.afterCompile - perf.afterAppend) + ' milliseconds.');
console.log('transclude took ' + (perf.afterTransclude - perf.afterCompile) + ' milliseconds.');
console.log('remove took ' + (perf.afterRemove - perf.afterTransclude) + ' milliseconds.');


function average(list){
    var total = 0;
    list.forEach(function(v){total+=v;})
    return total / (list.length + 1);
}
