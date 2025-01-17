//1. 按replace文件夹放资源
//2. star.apk
//3. 填写下面秘钥以及URL以及包名
const key = `x18f8iwz-2wuq-3s`;
// const key = `rpr9ojol-u2ct-he`;

const package = `com.xxxx.p${Math.floor(Date.now() / 1000)}`;
// const package = `com.xxxx.p1676471535`;
const appName = `果际娱乐`;
const url = `http://120.79.208.194:5432/`;
// const url = `https://wdly1-update.oss-accelerate.aliyuncs.com/`;

//如果要手动修改URL和把下面2个值设置成false、然后将project.js改好url即可
const replaceUrl = false;
const decodeJsc = false;

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const startTime = Date.now();

// console.log(path.resolve());
// console.log(path.join(path.resolve(), `../../src/project.jsc`))
//1. 解包
child_process.execFileSync('decode.bat', null, { cwd: '../' });
//2. 拷贝project.jsc
fs.copyFileSync(`../star/assets/src/project.jsc`, `../../src/project.jsc`);
//3. 替换key
let crack = fs.readFileSync(`../../crack.js`, { encoding: 'utf8', flag: 'r' });
let regex = new RegExp('var KEY = "([0-9a-zA-Z\-]+)"');
let ret = crack.match(regex);
if (!ret) {
    console.error(`not match key`);
    return;
}
crack = crack.replace(ret[1], key);
fs.writeFileSync(`../../crack.js`, crack);
//4. 解密
if (decodeJsc) {
    child_process.execFileSync('decode.bat', null, { cwd: '../../' });
}
let project = fs.readFileSync(`../../src/project.js`, { encoding: 'utf8', flag: 'r' });

//5. 替换服务器URL
if (replaceUrl) {
    // regex = new RegExp('https://([0-9a-zA-Z]+)-([\\S]+).oss-([\\S]+).aliyuncs.com/');
    regex = new RegExp('https://([\\S]+)-([\\S]+).oss-([\\S]+).aliyuncs.com/', "g");
    ret = project.match(regex);
    if (!ret) {
        console.error(`not match url`);
        return;
    }
    ret.forEach((element, idx) => {
        console.log(`idx ${idx}:` + element);
    });
    project = project.replace(regex, url);
}
//5. 替换游戏名
regex = new RegExp(`gameName: \".*\",`, "g")
ret = project.match(regex);
if (!ret) {
    console.error(`not match gameName`);
    return;
}
project = project.replace(regex, `gameName: "${appName}",`);
fs.writeFileSync(`../../src/project.js`, project);
//6. 将project.js >> jsc
child_process.execFileSync('encode.bat', null, { cwd: '../../' });
//7. 将project.jsc >> replace dir
if (!fs.existsSync(`../../src/project.jsc`)) {
    console.error(`project.jsc not found.`);
    return;
}
fs.copyFileSync(`../../src/project.jsc`, `../replace/assets/src/project.jsc`);
//8. 替换文件（assets、res文件夹、project.jsc）
//调用文件遍历方法
const filePath = `../replace/`;
copyRemFile(filePath, "../star/")
function copyRemFile(originPath, targetPath) {
    try {
        let sourceFile = fs.readdirSync(originPath);
        sourceFile.forEach((file) => {
            const newOriginPath = path.resolve(originPath, file)
            const newTargetPath = path.resolve(targetPath, file)
            let stat = fs.lstatSync(newOriginPath); //判断是文件夹不
            if (stat.isDirectory()) {
                //是的话继续循环判断
                copyRemFile(newOriginPath, newTargetPath)
            } else {
                fs.copyFileSync(newOriginPath, newTargetPath) //不是的话 执行替换操作
            }

        })
    } catch (err) {
        console.error(err);
        return 0;
    }
}
//9. 修改包名
const manifestFile = `../star/AndroidManifest.xml`;
let manifest = fs.readFileSync(manifestFile, { encoding: 'utf8', flag: 'r' });
regex = new RegExp('package="(.*)"');
ret = manifest.match(regex);
if (!ret) {
    console.error(`not match package`);
    return;
}
console.log(`match package:${ret[0]}`);
manifest = manifest.replace(ret[0], `package="${package}"`);
fs.writeFileSync(manifestFile, manifest);
//10. 替换appName
const stringsFile = `../star/res/values/strings.xml`;
let strings = fs.readFileSync(stringsFile, { encoding: 'utf8', flag: 'r' });
regex = new RegExp('<string name="app_name">(\\S)+</string>', "g");
ret = strings.match(regex);
if (!ret) {
    console.error(`not match appName`);
    return;
}
strings = strings.replace(regex, `<string name="app_name">${appName}</string>`);
fs.writeFileSync(stringsFile, strings);
//11. 生成apk
child_process.execFileSync('encode.bat', null, { cwd: '../' });

//12. 执行命令：压缩对齐
const dist = `../star/dist/dst.apk`
if (fs.existsSync(dist)) {
    fs.unlinkSync(dist);
}
child_process.execSync('Zipalign -v -f 4 star.apk dst.apk', { cwd: '../star/dist/' });

//13. 签名
const cmd = `apksigner sign -verbose --ks ../../key593.jks --v1-signing-enabled false --v2-signing-enabled true --ks-key-alias game593 --ks-pass pass:game593170223 --key-pass pass:game593170223 --out  ../../output/app-signed-aligned.apk dst.apk`;

child_process.execSync(cmd, { cwd: '../star/dist/' });

const time = Math.round((Date.now() - startTime) / 1000 / 60);
console.log(`runtime: ${time} minutes`);