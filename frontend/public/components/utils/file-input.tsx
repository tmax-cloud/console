import * as React from 'react';

export class FileInput extends React.Component<FileInputProps, FileInputState> {
  constructor(props) {
    super(props);
    this.state = {
      inputFileName: '',
      inputFileData: '',
    };
    this.onFileChange = this.onFileChange.bind(this);
  }
  onFileChange(event) {
    const file = event.target.files[0];
    this.setState({ inputFileName: file.name });
    const reader = new FileReader();
    reader.onload = () => {
      const input = reader.result;
      this.setState({
        inputFileData: input
      }, () => this.props.onChange(this.state.inputFileData));
    };
    reader.readAsText(file, 'UTF-8');
  }
  render() {
    const { t } = this.props;
    return <div className="input-group">
      <input type="text"
        className="form-control"
        value={this.state.inputFileName}
        readOnly
        disabled />
      <span className="input-group-btn">
        <span className="btn btn-default co-btn-file">
          {t('CONTENT:BROWSE')}&hellip;
          <input type="file" onChange={this.onFileChange} className="form-control" />
        </span>
      </span>
    </div>;
  }
}

/* eslint-disable no-undef */
export type FileInputState = {
  inputFileData: any,
  inputFileName: string,
};

export type FileInputProps = {
  onChange: Function,
  t: any
};
/* eslint-enable no-undef */
