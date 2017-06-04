var string = "/a 1 <spark-mention data-object-type=\"person\" data-object-id=\"Y2lzY29zcGFyazovL3VzL1BFT1BMRS9kMTE0NTY1Mi03MTViLTRhY2QtYTgwMC00MjFmMzgyYzM2MDI\">Inquire</spark-mention> What sessions will use this space for Q&amp;A?"
const reg1 = /(\<p\>)/i;
const reg2 = /(\<\/p\>)/i;
const reg3 = /(\<spark\-mention.*Inquire\<\/spark-mention\>)/i;
var newstring = string.replace( reg3, '' ).replace( reg1, '' ).replace( reg2, '' )

console.log( newstring );
