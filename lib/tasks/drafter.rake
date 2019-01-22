namespace :drafter do
  desc "Parse NPS responses."
  task(:nps_notes => :environment) do
    csvfile = ENV['csvfile']

    if (false == File.exist?(csvfile))
      raise "Sorry, expected csvfile as argument, got '#{csvfile}'."
    end

    CSV.foreach(csvfile, headers: true, header_converters: :symbol) do |row|
      last_name = row[:name].split(' ').last.capitalize
      division  = row[:division]

      if ('B1' == division)
        player = Player.where('last_name = ?', last_name).where('season_id = ?', Season.maximum(:id))

        if (1 < player.size)
          raise "Got too many players '#{last_name}' found '#{player.size}'."
        elsif (0 == player.size)
          puts "No info for '#{last_name}' in divions '#{division}'."
        else
          player = player.first

          player.position << ' NEW'

          if ('MISSING NPS' == row[:color])
            player.notes << 'Missed NPS'
          end

          if (false == row[:age].nil?)
            player.notes << "#{row[:age]} yo - #{row[:background_info]}"
          end

          player.save!
        end
      end
    end
  end
end
