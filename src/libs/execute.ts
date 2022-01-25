import child_process from 'child_process';


export default async function (command: string) {
	return child_process.execSync(command).toString();
}