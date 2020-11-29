export default function e(cb, getArgs = () => []) {
    return (e) => {
        e.preventDefault();
        const args = getArgs();
        console.log({cb, args});
        cb && cb(...args);
    }
}