import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import magnet from 'magnet-uri';
import * as requestActions from '../../redux/requestActions';
import { saveAs } from 'file-saver/FileSaver';
import { client } from './index';

class FileEntry extends Component
{
	state = {
		active   : false,
		numPeers : 0,
		progress : 0,
		files    : null
	};

	saveFile = (file) =>
	{
		file.getBlob((err, blob) =>
		{
			if (err)
			{
				return this.props.notify({
					text : 'An error occurred while saving a file'
				});
			}
	
			saveAs(blob, file.name);
		});
	};

	handleTorrent = (torrent) =>
	{
		// Torrent already done, this can happen if the
		// same file was sent multiple times.
		if (torrent.progress === 1)
		{
			this.setState({
				files    : torrent.files,
				numPeers : torrent.numPeers,
				progress : 1,
				active   : false
			});

			return;
		}

		const onProgress = () =>
		{
			this.setState({
				numPeers : torrent.numPeers,
				progress : torrent.progress
			});
		};

		onProgress();

		setInterval(onProgress, 500);

		torrent.on('done', () => 
		{
			onProgress();
			clearInterval(onProgress);

			this.setState({
				files  : torrent.files,
				active : false
			});
		});
	};

	download = () =>
	{
		this.setState({
			active : true
		});
		
		const magnet = this.props.data.file.magnet;

		const existingTorrent = client.get(magnet);

		if (existingTorrent)
		{
			// Never add duplicate torrents, use the existing one instead.
			return this.handleTorrent(existingTorrent);
		}

		client.add(magnet, this.handleTorrent);
	}

	render()
	{
		return (
			<Fragment>
				<div>
					{!this.state.active && !this.state.files && (
						<Fragment>
							{this.props.data.me ? (
								<p>You shared a file.</p>
							) : (
								<p>A new file was shared.</p>
							)}

							<p>{magnet.decode(this.props.data.file.magnet).dn}</p>

							<button onClick={this.download}>
								Download
							</button>
						</Fragment>
					)}

					{this.state.active && this.state.numPeers === 0 && (
						<div>
							Locating peers
						</div>
					)}

					{this.state.active && this.state.numPeers > 0 && (
						<progress value={this.state.progress} />
					)}

					{this.state.files && (
						<div>
							<p>Torrent finished downloading.</p>

							{this.state.files.map((file, i) => (
								<div key={i}>
									{file.name}

									<button onClick={() => this.saveFile(file)}>
										Save
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</Fragment>
		);
	}
}

const mapDispatchToProps = {
	notify : requestActions.notify
};

export default connect(
	undefined,
	mapDispatchToProps
)(FileEntry);