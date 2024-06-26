/** JS Implementation of BMIP10-ref.c */

function SetupBMIP10(sample_bits, coded_bits) {
  const config = {};

  config.sample_states = 1 << sample_bits;
  config.coded_states = 1 << coded_bits;
  config.lossy_code_width = (1 << (sample_bits - coded_bits + 1)) - 1;
  config.lossy_rounding = Math.floor(config.lossy_code_width / 2);
  config.lossless_codes = Math.floor(config.coded_states / 2);
  config.lossy_codes = Math.floor(config.coded_states / 2);
  config.code_tables = 1 + Math.floor(config.coded_states / 2);
  config.default_table = Math.floor(config.code_tables / 2);
  config.lowest_table_thresh = Math.floor(config.lossless_codes / 2);
  config.highest_table_thresh =
    config.sample_states - Math.floor(config.lossless_codes / 2);
  config.lossy_flag = Math.floor((1 << coded_bits) / 2);
  return config;
}

function NextTable(config, sample) {
  if (sample < config.lowest_table_thresh) {
    return 0;
  } else if (sample >= config.highest_table_thresh) {
    return config.lossy_codes;
  } else {
    return Math.floor(
      (sample - config.lowest_table_thresh + config.lossy_rounding) /
        config.lossy_code_width
    );
  }
}

function EncodeSample(config, table, sample) {
  const lossless_low = table * config.lossy_code_width;
  const lossless_high = lossless_low + config.lossless_codes;

  if (sample >= lossless_low && sample < lossless_high) {
    return sample - lossless_low;
  } else if (sample < lossless_low) {
    return config.lossy_flag | Math.floor(sample / config.lossy_code_width);
  } else {
    return (
      config.lossy_flag |
      (Math.floor((sample - lossless_high) / config.lossy_code_width) + table)
    );
  }
}

function DecodeSample(config, table, code_word) {
  const index = code_word & ~config.lossy_flag;

  if (code_word & config.lossy_flag) {
    if (index < table) {
      return index * config.lossy_code_width + config.lossy_rounding;
    } else {
      return (
        index * config.lossy_code_width +
        config.lossy_rounding +
        config.lossless_codes
      );
    }
  } else {
    return table * config.lossy_code_width + index;
  }
}

class Encoder {
  constructor(sample_bits, coded_bits) {
    this.config = SetupBMIP10(sample_bits, coded_bits);
    this.table = this.config.default_table;
  }

  encode(samples) {
    const codeout = [];
    for (let index = 0; index < samples.length; index++) {
      const sample = samples[index];

      const code_word = EncodeSample(this.config, this.table, sample);
      const decoded = DecodeSample(this.config, this.table, code_word);
      this.table = NextTable(this.config, decoded);
      // console.log(
      //   `Used table ${table_old} to encode sample ${sample} to codeword ${code_word}. Decoder will decode ${decoded} so ${
      //     table === table_old ? "sticking with" : "changing to"
      //   } table ${table}`
      // );
      codeout.push(code_word);
    }
    return codeout;
  }

  reset() {
    this.pickupTable = this.config.default_table;
  }
}

class Decoder {
  constructor(sample_bits, coded_bits) {
    this.config = SetupBMIP10(sample_bits, coded_bits);
    this.table = this.config.default_table;
  }

  decode(samples) {
    const sampout = [];

    for (let index = 0; index < samples.length; index++) {
      const code_word = samples[index];
      const decoded = DecodeSample(this.config, this.table, code_word);
      this.table = NextTable(this.config, decoded);
      this.table_old = this.table;
      console.log(
        `Used table ${
          this.table_old
        } to decode codeword ${code_word} to sample ${decoded} so ${
          this.table === this.table_old ? "sticking with" : "changing to"
        } table ${this.table}`
      );
      sampout.push(decoded);
    }
    return sampout;
  }

  reset() {
    this.pickupTable = this.config.default_table;
  }
}

module.exports = {
  Encoder,
  Decoder,
};