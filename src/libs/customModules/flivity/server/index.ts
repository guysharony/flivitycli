interface Server {
	domain: string;
	mode: 'development' | 'production' | 'deploy';
}

export default ((__server: Server) => {

	return {
		set domain(value: string) {
			__server.domain = value;
		},
		get domain() {
			return __server.domain;
		},
		set mode(value: 'development' | 'production' | 'deploy') {
			__server.domain = value;
		},
		get mode() {
			return __server.mode;
		}
	}

})({
	domain: 'https://localhost',
	mode: 'development'
})