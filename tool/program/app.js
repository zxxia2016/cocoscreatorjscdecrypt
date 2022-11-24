//1. 按replace文件夹放资源
//2. star.apk
//3. 填写下面秘钥以及URL以及包名
//const key = `9e988deb-dab7-4b`;
const key = `rpr9ojol-u2ct-he`;

const package = `com.thai.lucky1.p${Math.floor(Date.now() / 1000)}`;
const appName = `果品娱乐`;
const url = `https://gpkj-update.oss-cn-shenzhen.aliyuncs.com/`;

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
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
child_process.execFileSync('decode.bat', null, { cwd: '../../' });
//5. 替换服务器URL
let project = fs.readFileSync(`../../src/project.js`, { encoding: 'utf8', flag: 'r' });
regex = new RegExp('preloadUrl: "https://([0-9a-zA-Z]+)-update.oss-cn-shenzhen.aliyuncs.com/');
ret = project.match(regex);
if (!ret) {
    console.error(`not match url`);
    return;
}
regex = new RegExp(ret[0], "g")
project = project.replace(regex, `preloadUrl: "` + url);
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
regex = new RegExp('com.([0-9a-zA-Z.]+)[0-9]+', "g");
ret = manifest.match(regex);
if (!ret) {
    console.error(`not match package`);
    return;
}
manifest = manifest.replace(regex, package);
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

console.log(`end`)