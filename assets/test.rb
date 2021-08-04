require 'xml/smart'

Dir.glob('*.svg').each do |f|
  doc = XML::Smart.open(f)
  doc.root.find('*').each do |e|
    puts e.qname.name
  end
  puts '---'
end

