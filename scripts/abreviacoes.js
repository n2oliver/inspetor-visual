const abreviacoes = [
    [/\—/gi, '\n '],
    [/\*/gi, ' '],
    [/-\n/gi, ''],
    [/\n/gi, ' '],
    [/•/gi, "; "],
    [/\b\:/gi, ". "],
];

export { abreviacoes };