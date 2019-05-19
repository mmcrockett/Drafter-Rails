require 'csv'
require 'optparse'
require 'byebug'

OLD_HEADERS = [
  'Position / Level',
  'First Name',
  'Last Name',
  'Two League',
  'Sharing',
  'Team Request',
  'Other/Notes'
]

EXPECTED_NOTES_HEADERS = [
  'First and Last Name',
  'Attending NPS?',
  'Division',
  'Position',
  'Age',
  'Exp',
  'Background Info',
  'Comments'
]

class TranslateCsv
  def initialize(file, notes_file = nil)
    raise "Not found #{file}" unless File.exist?(file)

    @input_data = CSV.read(file, headers: true)
    @notes      = create_notes(notes_file)
    @outfile    = "#{File.basename(file, '.csv')}"
  end

  def translate
    data = {}

    @input_data.each do |row|
      division = row['Group'].split(' ').first
      data[division] ||= []
      data[division] << [to_old(row['Group']), row['First Name'], row['Last Name'], nil, nil, nil, nps_note(row['First Name'], row['Last Name'])]
    end

    data.each_pair do |division, players|
      CSV.open("#{@outfile}.#{division}.csv", "wb") do |csv|
        csv << OLD_HEADERS
        players.each do |player|
          csv << player
        end
      end
    end
  end

  private

  def to_old(division_info)
    division_info = division_info.upcase
    result = ''

    if (division_info.include?('GOALIE'))
      result << 'GOALIE'
    else
      result << 'SKATER'
      result << ' NEW' if division_info.include?('NEW')
    end

    result << ' - ' << division_info.split(' ').first << ' DIV'

    return result
  end

  def create_notes(notes_file)
    notes = {}

    if (false == notes_file.nil?)
      raise "Can't find #{notes_file}" unless File.exist?(notes_file)

      csv_data = CSV.read(notes_file, headers: true)

      raise "Not expected header #{EXPECTED_NOTES_HEADERS} - you may have to modify the exp and comment headers to match." unless (EXPECTED_NOTES_HEADERS - csv_data.headers).empty?

      csv_data.each do |note|
        snote = ''

        if ('no reply' == note['Attending NPS?'])
          snote = 'No reply on NPS form'
        else
          snote << "#{note['Age']}yo" unless note['Age'].nil?
          snote << " #{note['Position']}"
          snote << " NO NPS" if note['Attending NPS?'].upcase.include?('NO')
          snote << " #{note["Exp"]}"
          snote << " yrs" if (note['Exp'] == note['Exp'].to_i.to_s)
          snote << " #{note['Background Info']}"
          snote << " - Beer #{note['Comments']}"
        end

        notes[note['First and Last Name'].strip.downcase] = snote
      end
    end

    return notes
  end

  def nps_note(first_name, last_name)
    return @notes["#{first_name} #{last_name}".downcase]
  end
end

options = {}
OptionParser.new do |opt|
  opt.banner = "Usage: translate_csv.rb <input_file>"
  opt.on('-n', '--notes file', 'Use new player notes file to add note.') { |o| options[:notes_file] = o }
end.parse!

TranslateCsv.new(ARGV.first, options[:notes_file]).translate
