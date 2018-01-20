const publicIp = require('public-ip');
const jsonFile = require('jsonfile');
const { promisify, inspect } = require('util');
const fs = require('fs');
const got = require('got');
const parseStringAsync = promisify(require('xml2js').parseString);
const readFileAsync = promisify(fs.readFile);
const hostFilePath = './hosts.json';
const apiKey = process.env.API_KEY;

const getCurrentIp = async () => {
    return await publicIp.v4();
}

const parseHostsFile = async () => {
    let records = [];
    try {
        records = JSON.parse(await readFileAsync(hostFilePath, { encoding: 'utf8' }));
    } catch(e) {
        console.log(e);
    }

    return records;
}


const listRecordsForDomain = async (domain, hostName) => {
    const uri = `https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key=${apiKey}&domain=${domain}`;
    let response = null;
    try {
        tempResponse = await got(uri);
        response = await parseStringAsync(tempResponse.body);
    } catch (e) {
        console.log(e);
    }

    return convertRecordData(response, domain, hostName);
}

const convertRecordData = (response, domain, hostName) => {
    let convertedResponse = {};

    if(response) {
        const replyCode = response.namesilo.reply[0].code[0];
        let record = null;
        if(hostName !== "")
            record = response.namesilo.reply[0].resource_record.find(x => x.host[0] === `${hostName}.${domain}`);
        else
            record = response.namesilo.reply[0].resource_record.find(x => x.host[0] === `${domain}`);

        if(record) {
            convertedResponse = {
                code: parseInt(replyCode),
                type: record.type[0],
                record_id: record.record_id[0],
                currentIp: record.value[0],
                ttl: parseInt(record.ttl[0]),
                hostName: hostName,
                domain: domain
            };
        }
    }
    
    return convertedResponse;
}

const updateRecord = async (currentHostIp, domainInfo) => {
    const uri = `https://www.namesilo.com/api/dnsUpdateRecord?version=1&type=xml&key=${apiKey}&domain=${domainInfo.domain}&rrid=${domainInfo.record_id}&rrhost=${domainInfo.hostName}&rrvalue=${currentHostIp}&rrttl=${domainInfo.ttl}`;

    let response = null;
    try {
        tempResponse = await got(uri);
        response = await parseStringAsync(tempResponse.body);
    } catch (e) {
        console.log(e);
    }

    return response;
}

const main = async () => {
    const currentHostIp = await getCurrentIp();
    console.log(`Host IP: ${currentHostIp}`);

    const records = await parseHostsFile();
    console.log(records);
    records.forEach(async (record) => {
        record.hostNames.forEach( async (hostName) => {
            console.log(`Processing ${hostName}.${record.domainName}`);
            const domainInfo = await listRecordsForDomain(record.domainName, hostName);
            if(domainInfo && currentHostIp !== domainInfo.currentIp && domainInfo.code === 300) {
                console.log(`Updating ${domainInfo.hostName}.${domainInfo.domain} from ${domainInfo.currentIp} to ${currentHostIp}`)
                const response = await updateRecord(currentHostIp, domainInfo);
                console.log(inspect(response, false, null));
            }
        });
    });
}

(async () => {
    try {
        await main();
    } catch(e) {
        console.log(e);
    }
})();



